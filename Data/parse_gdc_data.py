"""
parse_gdc_data.py

Starter script for the Cancer Genomics Data Explorer data pipeline.

Parses:
  1. A GDC STAR-Counts gene expression TSV (one file per case/sample)
  2. GDC's bulk clinical.tsv export (one flat table, one row per case)

...into two clean pandas DataFrames ready to write out as Parquet:
  - expression_df: one row per (case_id, gene_id), with gene_name, tpm, fpkm, unstranded counts
  - clinical_df:   one row per case_id, with the fields needed for survival analysis

...and then runs a Kaplan-Meier survival analysis for a chosen gene, writing
out a tidy step-coordinate CSV that Tableau can plot directly as a line chart
(no survival math happens inside Tableau — it's all done here).

This is a starting point, not a finished pipeline — extend the TODOs as you
bring in more files (loop over many cases, add miRNA parsing, etc).

Requires: pandas, lifelines  (pip install pandas lifelines)
"""

import math
import re

import numpy as np
import pandas as pd
from pathlib import Path
from lifelines import CoxPHFitter, KaplanMeierFitter
from lifelines.statistics import logrank_test


# ---------------------------------------------------------------------------
# 1. Parse a single STAR-Counts gene expression TSV
# ---------------------------------------------------------------------------

def parse_star_counts(tsv_path: str, case_id: str) -> pd.DataFrame:
    """
    GDC STAR-Counts files have a few comment/summary rows at the top
    (N_unmapped, N_multimapping, etc.) before the real gene rows start.
    This skips those and keeps only real gene records.
    """
    df = pd.read_csv(tsv_path, sep="\t", comment="#", skiprows=1)

    # Drop the N_* summary rows GDC includes at the top of the gene column
    df = df[~df["gene_id"].str.startswith("N_")]

    # Keep only the columns you actually need for the dashboard
    keep_cols = ["gene_id", "gene_name", "gene_type", "unstranded", "tpm_unstranded", "fpkm_unstranded"]
    df = df[keep_cols].rename(columns={
        "unstranded": "raw_count",
        "tpm_unstranded": "tpm",
        "fpkm_unstranded": "fpkm",
    })

    df["case_id"] = case_id
    return df


# ---------------------------------------------------------------------------
# 2. Parse GDC's bulk clinical TSV export
# ---------------------------------------------------------------------------
#
# GDC's "clinical.tsv" bulk export is a flat table, one row per case, with
# dotted/underscored column names like:
#   cases.case_id, demographic.vital_status, demographic.days_to_death,
#   diagnoses.days_to_last_follow_up, diagnoses.age_at_diagnosis,
#   diagnoses.ajcc_pathologic_stage, diagnoses.primary_diagnosis,
#   demographic.sex_at_birth, demographic.race
#
# IMPORTANT: run this once on your real file first —
#   pd.read_csv("raw/clinical/clinical.tsv", sep="\t").columns.tolist()
# — and adjust COLUMN_MAP below if your export uses different exact names
# (GDC has changed these slightly across portal versions).

COLUMN_MAP = {
    "case_id": "cases.case_id",                    # UUID — internal GDC identity, NOT used for joins here
    "case_submitter_id": "cases.submitter_id",      # human-readable ID (e.g. "HCM-CSHL-0817-C22") — matches the sample sheet's "Case ID"
    "vital_status": "demographic.vital_status",
    "days_to_death": "demographic.days_to_death",
    "days_to_last_follow_up": "diagnoses.days_to_last_follow_up",
    "age_at_diagnosis": "diagnoses.age_at_diagnosis",
    "tumor_stage": "diagnoses.ajcc_pathologic_stage",
    "primary_diagnosis": "diagnoses.primary_diagnosis",
    "sex_at_birth": "demographic.sex_at_birth",
    "race": "demographic.race",
}


def _normalise_stage(value):
    """
    Collapses AJCC pathologic stage strings into I / II / III / IV.
    "Stage IA", "Stage IB" -> "I";  "Stage IIIB" -> "III";  "Stage IVA" -> "IV".
    "Not Reported", "Unknown", "Stage 0" etc. -> NA (left out of stage filtering
    rather than shown as a misleading stage).
    """
    if pd.isna(value):
        return pd.NA
    match = re.match(r"^\s*stage\s+(iv|iii|ii|i)", str(value), flags=re.IGNORECASE)
    return match.group(1).upper() if match else pd.NA


def build_clinical_table(clinical_tsv_path: str) -> pd.DataFrame:
    """
    Reads GDC's bulk clinical.tsv export and derives the survival
    time/event columns needed for Kaplan-Meier analysis (lifelines), plus
    the clinical filter columns used for subgroup curves:
        stage_group (I-IV), age_years + age_band (<50 / 50-64 / 65+), sex.
    """
    raw = pd.read_csv(clinical_tsv_path, sep="\t", na_values=["'--", "--", ""])

    df = pd.DataFrame()
    for clean_name, source_col in COLUMN_MAP.items():
        df[clean_name] = raw[source_col] if source_col in raw.columns else pd.NA

    # Build the survival time/event pair used directly by lifelines:
    #   event = 1 if the patient died (observed), 0 if censored (still alive)
    died = df["vital_status"] == "Dead"
    df["event"] = died.astype(int)
    df["time_days"] = df["days_to_death"].where(died, df["days_to_last_follow_up"])

    # --- Clinical filter columns (unknown / not reported values become NA) ---

    # Stage: collapse substages (IA, IIIB, ...) into I-IV
    df["stage_group"] = df["tumor_stage"].map(_normalise_stage)

    # Age: GDC stores age_at_diagnosis in DAYS
    df["age_years"] = pd.to_numeric(df["age_at_diagnosis"], errors="coerce") / 365.25
    df["age_band"] = pd.cut(
        df["age_years"], bins=[0, 50, 65, 200], labels=["<50", "50-64", "65+"], right=False
    ).astype("object")

    # Sex: some GDC exports use demographic.gender instead of sex_at_birth
    sex = df["sex_at_birth"]
    if sex.isna().all() and "demographic.gender" in raw.columns:
        sex = raw["demographic.gender"]
    sex = sex.astype("string").str.strip().str.capitalize()
    df["sex"] = sex.where(sex.isin(["Male", "Female"]), pd.NA).astype("object")

    # Some cases list multiple diagnosis rows in the TSV — keep one row per case
    df = df.drop_duplicates(subset="case_id")

    # NOTE: expression_df's case_id (built from the sample sheet's "Case ID"
    # column) is a submitter ID like "HCM-CSHL-0817-C22", NOT this table's
    # UUID case_id. build_km_curve_table joins on case_submitter_id below.

    return df


# ---------------------------------------------------------------------------
# 3. Batch over a directory of downloaded GDC files
# ---------------------------------------------------------------------------

def load_case_id_map(sample_sheet_path: str) -> dict:
    """
    Reads GDC's "Sample Sheet" TSV — downloaded alongside your manifest from
    the GDC cart/download page — and builds a {file_id: case_id} lookup.

    GDC's sample sheet columns are typically named "File ID" and "Case ID"
    (sometimes "Case IDs", plural, if a file is shared across cases — this
    takes the first one listed). Run this once and print .columns.tolist()
    on your real file if the column names don't match.
    """
    sheet = pd.read_csv(sample_sheet_path, sep="\t")

    file_id_col = "File ID" if "File ID" in sheet.columns else "file_id"
    case_id_col = "Case ID" if "Case ID" in sheet.columns else "Case IDs"

    mapping = {}
    for _, row in sheet.iterrows():
        file_id = row[file_id_col]
        # Some rows list multiple comma-separated case IDs; take the first
        case_id = str(row[case_id_col]).split(",")[0].strip()
        mapping[file_id] = case_id

    return mapping


def build_expression_table(rnaseq_dir: str, case_id_map: dict) -> pd.DataFrame:
    """
    Walks a directory of {file_id}/*.tsv folders (gdc-client's default
    download layout) and concatenates every STAR-Counts file into one table.

    case_id_map comes from load_case_id_map() — without it, every row would
    be keyed by file_id, which never matches the case_id values in
    clinical_df, and any downstream join (like build_km_curve_table) would
    silently return zero rows.
    """
    all_rows = []
    skipped = []
    for folder in Path(rnaseq_dir).iterdir():
        if not folder.is_dir():
            continue
        tsv_files = list(folder.glob("*.tsv"))
        if not tsv_files:
            continue

        file_id = folder.name
        case_id = case_id_map.get(file_id)
        if case_id is None:
            skipped.append(file_id)
            continue

        df = parse_star_counts(str(tsv_files[0]), case_id=case_id)
        all_rows.append(df)

    if skipped:
        print(f"Warning: {len(skipped)} file(s) had no matching case_id in the sample sheet, skipped: {skipped[:5]}{'...' if len(skipped) > 5 else ''}")

    return pd.concat(all_rows, ignore_index=True) if all_rows else pd.DataFrame()


# ---------------------------------------------------------------------------
# 4. Kaplan-Meier survival analysis for one gene, exported for Tableau
# ---------------------------------------------------------------------------

def build_km_curve_table(expression_df: pd.DataFrame, clinical_df: pd.DataFrame, gene_name: str) -> pd.DataFrame:
    """
    For a given gene, splits patients into High/Low expression groups by
    the median TPM, fits a Kaplan-Meier curve for each group, and returns
    a tidy long-format table of step coordinates:

        gene | group | time_days | survival_prob

    This is the table Tableau plots directly — Tableau does no survival
    math itself, it just draws time_days (x) vs survival_prob (y) as a
    Step Line, colored by group.
    """
    gene_expr = expression_df[expression_df["gene_name"] == gene_name][["case_id", "tpm"]]
    if gene_expr.empty:
        raise ValueError(f"Gene '{gene_name}' not found in expression_df")

    # expression_df's case_id is the sample-sheet submitter ID
    # (e.g. "HCM-CSHL-0817-C22"), so join against clinical_df's matching
    # case_submitter_id column — NOT its UUID case_id column.
    merged = gene_expr.merge(
        clinical_df[["case_submitter_id", "time_days", "event"]].rename(columns={"case_submitter_id": "case_id"}),
        on="case_id", how="inner",
    )
    merged = merged.dropna(subset=["time_days", "event"])
    if merged.empty:
        raise ValueError(
            f"No matching patients for '{gene_name}' after joining expression to clinical data — "
            "check that expression_df['case_id'] and clinical_df['case_submitter_id'] use the same ID format."
        )

    # Median split into High / Low expression groups
    median_tpm = merged["tpm"].median()
    merged["group"] = merged["tpm"].apply(lambda x: "High" if x >= median_tpm else "Low")

    rows = []
    kmf = KaplanMeierFitter()
    for group_name, group_df in merged.groupby("group"):
        kmf.fit(durations=group_df["time_days"], event_observed=group_df["event"], label=group_name)

        # survival_function_ is lifelines' own step table: index = time, one column = survival prob
        step_table = kmf.survival_function_.reset_index()
        step_table.columns = ["time_days", "survival_prob"]
        step_table["group"] = group_name
        step_table["gene"] = gene_name
        rows.append(step_table)

    return pd.concat(rows, ignore_index=True)[["gene", "group", "time_days", "survival_prob"]]


def build_km_curve_table_multi(expression_df: pd.DataFrame, clinical_df: pd.DataFrame, gene_names: list) -> pd.DataFrame:
    """
    Runs build_km_curve_table for every gene in gene_names and stacks the
    results into one combined long-format table:

        gene | group | time_days | survival_prob

    This is the table to hand to Tableau for a gene-picker dashboard: put
    it on a Parameter or Filter action bound to the "gene" column, so the
    user selects a gene and the Step Line chart updates to that gene's
    High/Low survival curves without re-running any Python.

    Genes that error (e.g. not found in expression_df, or too few patients
    in a group to fit a curve) are skipped with a printed warning rather
    than stopping the whole batch.
    """
    all_curves = []
    for gene_name in gene_names:
        try:
            all_curves.append(build_km_curve_table(expression_df, clinical_df, gene_name))
        except Exception as e:
            print(f"Skipping {gene_name}: {e}")

    return pd.concat(all_curves, ignore_index=True) if all_curves else pd.DataFrame()


# ---------------------------------------------------------------------------
# 4b. Subgroup (clinical-filter) Kaplan-Meier curves
# ---------------------------------------------------------------------------
#
# Tableau can't filter a precomputed KM curve by clinical variables — hiding
# rows of a curve fitted on the whole cohort doesn't re-estimate survival for
# the subgroup. So the curves are refit here, once per gene per subgroup, and
# Tableau just picks which pre-fitted subgroup to show.
#
# Within each subgroup, High/Low is a median split of expression *within that
# subgroup* (so both arms stay balanced). Single-variable subgroups only
# (e.g. Stage II, or Female) — no cross-combinations like "Stage II + Female",
# which would shrink groups too far and multiply the row count.

# {label shown in the dashboard: column in clinical_df}
STRATA_COLUMNS = {
    "Stage": "stage_group",
    "Age": "age_band",
    "Sex": "sex",
}

MIN_PATIENTS_PER_ARM = 10  # subgroups with fewer High or Low patients are skipped


def _km_for_subset(subset: pd.DataFrame, gene_name: str, label: str, value: str, min_n: int):
    """
    Median-splits `subset` into High/Low expression, fits a KM curve per arm and
    returns a tidy step table. Returns None if either arm has < min_n patients.
    """
    median_tpm = subset["tpm"].median()
    subset = subset.assign(group=subset["tpm"].ge(median_tpm).map({True: "High", False: "Low"}))

    arm_sizes = subset["group"].value_counts()
    if arm_sizes.get("High", 0) < min_n or arm_sizes.get("Low", 0) < min_n:
        return None

    high = subset[subset["group"] == "High"]
    low = subset[subset["group"] == "Low"]
    try:
        p_value = logrank_test(
            high["time_days"], low["time_days"],
            event_observed_A=high["event"], event_observed_B=low["event"],
        ).p_value
    except Exception:
        p_value = float("nan")

    rows = []
    kmf = KaplanMeierFitter()
    for group_name, group_df in subset.groupby("group"):
        kmf.fit(durations=group_df["time_days"], event_observed=group_df["event"], label=group_name)

        step_table = kmf.survival_function_.reset_index()
        step_table.columns = ["time_days", "survival_prob"]
        step_table["group"] = group_name
        step_table["n_group"] = len(group_df)
        step_table["n_events"] = int(group_df["event"].sum())

        # lifelines returns inf when the curve never drops to 50% — keep the column numeric
        median_surv = kmf.median_survival_time_
        step_table["median_survival_days"] = median_surv if math.isfinite(median_surv) else float("nan")
        rows.append(step_table)

    out = pd.concat(rows, ignore_index=True)
    out["gene"] = gene_name
    out["stratum_variable"] = label
    out["stratum_value"] = value
    # One combined label so Tableau needs just ONE dropdown: "Overall", "Stage: II", "Sex: Female", ...
    out["subgroup"] = "Overall" if label == "Overall" else f"{label}: {value}"
    out["time_months"] = out["time_days"] / 30.4375
    out["logrank_p"] = p_value
    return out


def build_km_curve_table_stratified(
    expression_df: pd.DataFrame,
    clinical_df: pd.DataFrame,
    gene_names: list,
    strata: dict = STRATA_COLUMNS,
    min_n: int = MIN_PATIENTS_PER_ARM,
) -> pd.DataFrame:
    """
    For every gene, fits High/Low KM curves for the whole cohort ("Overall") and
    for each single-variable clinical subgroup in `strata`. Output columns:

        gene | subgroup | stratum_variable | stratum_value | group |
        time_days | time_months | survival_prob |
        n_group | n_events | median_survival_days | logrank_p

    In Tableau, filter `subgroup` (single-value dropdown, default "Overall")
    alongside the gene picker — each gene/subgroup pair is one complete,
    correctly-fitted High-vs-Low curve pair. Without a `subgroup` filter the
    sheet would overlay every subgroup's curves on top of each other.
    """
    clin_cols = ["case_submitter_id", "time_days", "event"] + list(strata.values())
    clin = (
        clinical_df[clin_cols]
        .rename(columns={"case_submitter_id": "case_id"})
        .dropna(subset=["time_days", "event"])
    )

    all_curves = []
    skipped = 0
    for gene_name in gene_names:
        gene_expr = expression_df.loc[expression_df["gene_name"] == gene_name, ["case_id", "tpm"]]
        merged = gene_expr.merge(clin, on="case_id", how="inner")
        if merged.empty:
            print(f"Skipping {gene_name}: no patients after joining expression to clinical data")
            continue

        subsets = [("Overall", "All", merged)]
        for label, column in strata.items():
            # groupby drops NA, so unknown / not-reported values never become a subgroup
            for value, sub in merged.groupby(column):
                subsets.append((label, str(value), sub))

        for label, value, sub in subsets:
            curve = _km_for_subset(sub, gene_name, label, value, min_n)
            if curve is None:
                skipped += 1
            else:
                all_curves.append(curve)

    if skipped:
        print(f"Skipped {skipped} gene/subgroup combination(s) with fewer than {min_n} patients in the High or Low arm")

    cols = [
        "gene", "subgroup", "stratum_variable", "stratum_value", "group",
        "time_days", "time_months", "survival_prob",
        "n_group", "n_events", "median_survival_days", "logrank_p",
    ]
    return pd.concat(all_curves, ignore_index=True)[cols] if all_curves else pd.DataFrame(columns=cols)


# ---------------------------------------------------------------------------
# 4c. Per-gene panel tables (the "gene page" under the KM curve in Tableau)
# ---------------------------------------------------------------------------
#
# Three tables, all keyed by `gene`, all using the SAME High/Low definition as
# the Overall KM curve (median TPM split across the whole cohort):
#
#   gene_patients.csv  one row per (gene, patient): TPM, High/Low group and the
#                      clinical columns. Drives the expression histogram, the
#                      expression-by-clinical-group box plots and the High-vs-Low
#                      cohort-makeup bars.
#   gene_stats.csv     one row per gene, numeric: n, median TPM, median survival,
#                      hazard ratio + 95% CI, log-rank p, FDR-adjusted p.
#   gene_summary.csv   the same stats as display-ready text, one row per
#                      (gene, metric) — drops straight into a Tableau text table.
#
# Hazard ratio is High vs Low expression (Cox proportional hazards): HR > 1
# means the High group has a higher risk of death.

PATIENT_COLUMNS = ["vital_status", "stage_group", "age_years", "age_band", "sex"]


def _bh_fdr(p_values: pd.Series) -> pd.Series:
    """Benjamini-Hochberg FDR-adjusted p-values. NaNs stay NaN."""
    p = p_values.dropna().sort_values()
    m = len(p)
    if m == 0:
        return p_values
    ranks = pd.Series(range(1, m + 1), index=p.index)
    adjusted = (p * m / ranks).iloc[::-1].cummin().iloc[::-1].clip(upper=1.0)
    return adjusted.reindex(p_values.index)


def _format_p(p) -> str:
    if pd.isna(p):
        return "n/a"
    return "<0.001" if p < 0.001 else f"{p:.3f}"


def _format_months(days) -> str:
    return "Not reached" if pd.isna(days) else f"{days / 30.4375:.1f}"


def _cox_hazard_ratio(df: pd.DataFrame):
    """Hazard ratio (High vs Low) with 95% CI from a one-covariate Cox model."""
    try:
        cph = CoxPHFitter()
        cph.fit(df[["time_days", "event", "high"]], duration_col="time_days", event_col="event")
        row = cph.summary.loc["high"]
        return row["exp(coef)"], row["exp(coef) lower 95%"], row["exp(coef) upper 95%"]
    except Exception:
        return float("nan"), float("nan"), float("nan")


def build_gene_panel_tables(
    expression_df: pd.DataFrame,
    clinical_df: pd.DataFrame,
    gene_names: list,
    min_n: int = MIN_PATIENTS_PER_ARM,
):
    """Returns (gene_stats_df, gene_summary_df, gene_patients_df)."""
    clin = clinical_df[["case_submitter_id", "time_days", "event"] + PATIENT_COLUMNS].copy()
    clin = clin.rename(columns={"case_submitter_id": "case_id"}).dropna(subset=["time_days", "event"])
    clin["outcome"] = clin["event"].map({1: "Deceased", 0: "Alive (censored)"})
    clin["time_months"] = clin["time_days"] / 30.4375

    patient_tables, stat_rows = [], []
    for gene_name in gene_names:
        gene_expr = expression_df.loc[expression_df["gene_name"] == gene_name, ["case_id", "tpm"]]
        merged = gene_expr.merge(clin, on="case_id", how="inner")
        if merged.empty:
            print(f"Skipping {gene_name}: no patients after joining expression to clinical data")
            continue

        cutoff = merged["tpm"].median()
        merged["group"] = merged["tpm"].ge(cutoff).map({True: "High", False: "Low"})
        high = merged[merged["group"] == "High"]
        low = merged[merged["group"] == "Low"]
        if len(high) < min_n or len(low) < min_n:
            print(f"Skipping {gene_name}: fewer than {min_n} patients in the High or Low arm")
            continue

        # Survival statistics
        try:
            logrank_p = logrank_test(
                high["time_days"], low["time_days"],
                event_observed_A=high["event"], event_observed_B=low["event"],
            ).p_value
        except Exception:
            logrank_p = float("nan")

        hr, hr_lo, hr_hi = _cox_hazard_ratio(merged.assign(high=(merged["group"] == "High").astype(int)))

        kmf = KaplanMeierFitter()
        median_days = {}
        for arm_name, arm in (("High", high), ("Low", low)):
            kmf.fit(arm["time_days"], arm["event"])
            m = kmf.median_survival_time_
            median_days[arm_name] = m if math.isfinite(m) else float("nan")

        stat_rows.append({
            "gene": gene_name,
            "n_patients": len(merged),
            "n_high": len(high),
            "n_low": len(low),
            "n_events_high": int(high["event"].sum()),
            "n_events_low": int(low["event"].sum()),
            "median_tpm": cutoff,
            "median_survival_high_days": median_days["High"],
            "median_survival_low_days": median_days["Low"],
            "hazard_ratio": hr,
            "hr_ci_lower": hr_lo,
            "hr_ci_upper": hr_hi,
            "logrank_p": logrank_p,
        })

        # Patient-level rows
        merged["gene"] = gene_name
        merged["cutoff_tpm"] = cutoff
        merged["log2_tpm"] = np.log2(merged["tpm"] + 1)
        patient_tables.append(merged)

    if not stat_rows:
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

    stats_df = pd.DataFrame(stat_rows)
    stats_df["fdr_p"] = _bh_fdr(stats_df["logrank_p"])

    # Display-ready long table: one text row per (gene, metric)
    summary_rows = []
    for r in stats_df.itertuples(index=False):
        hr_text = "n/a" if pd.isna(r.hazard_ratio) else f"{r.hazard_ratio:.2f} ({r.hr_ci_lower:.2f}–{r.hr_ci_upper:.2f})"
        tiles = [
            ("Patients (High / Low)", f"{r.n_patients} ({r.n_high} / {r.n_low})"),
            ("Median expression (TPM)", f"{r.median_tpm:.1f}"),
            ("Median survival, High (months)", _format_months(r.median_survival_high_days)),
            ("Median survival, Low (months)", _format_months(r.median_survival_low_days)),
            ("Hazard ratio, High vs Low (95% CI)", hr_text),
            ("Log-rank p-value", _format_p(r.logrank_p)),
            ("FDR-adjusted p-value", _format_p(r.fdr_p)),
        ]
        for order, (metric, value) in enumerate(tiles, start=1):
            summary_rows.append({"gene": r.gene, "order": order, "metric": metric, "value": value})
    summary_df = pd.DataFrame(summary_rows)

    patients_df = pd.concat(patient_tables, ignore_index=True)
    patients_df = patients_df[
        ["gene", "case_id", "tpm", "log2_tpm", "cutoff_tpm", "group"]
        + ["vital_status", "outcome", "event", "time_days", "time_months"]
        + ["stage_group", "age_years", "age_band", "sex"]
    ]
    patients_df[["log2_tpm", "time_months", "age_years"]] = patients_df[["log2_tpm", "time_months", "age_years"]].round(3)

    return stats_df, summary_df, patients_df


# ---------------------------------------------------------------------------
# 5. Select the most variable genes across cases
# ---------------------------------------------------------------------------

def select_top_variable_genes(expression_df: pd.DataFrame, n: int = 200, value_col: str = "tpm") -> list:
    """
    Picks the top-`n` most variable genes across cases, ranked by variance
    of `value_col` (TPM by default) across all cases in expression_df.

    This is the standard first filter before clustering/heatmaps/dashboards:
    most genes barely move between patients and just add noise, so ranking
    by cross-case variance surfaces the genes that actually differ between
    cases. Returns a plain list of gene_name strings, highest variance first.

    NOTE: this ranks on raw TPM variance, which skews toward highly-expressed
    genes (variance scales with the square of the mean). If you want variance
    that isn't dominated by expression level, log-transform first, e.g.:
        expression_df["log_tpm"] = np.log2(expression_df["tpm"] + 1)
    and pass value_col="log_tpm".
    """
    # One row per (gene_name, case_id) is expected; pivot so each gene is a
    # row and each case is a column, then take variance across the case columns.
    pivoted = expression_df.pivot_table(index="gene_name", columns="case_id", values=value_col)

    gene_variance = pivoted.var(axis=1, skipna=True).sort_values(ascending=False)

    top_genes = gene_variance.head(n).index.tolist()
    return top_genes


# ---------------------------------------------------------------------------
# 6. Example usage
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    case_id_map = load_case_id_map("raw/rnaseq/gdc_sample_sheet.tsv")  # TODO: point at your actual sample sheet path
    expression_df = build_expression_table("raw/rnaseq", case_id_map=case_id_map)
    clinical_df = build_clinical_table("raw/clinical/clinical.tsv")

    print(expression_df.head())
    print(clinical_df.head())

    # Write out clean Parquet tables for the dashboard / Azure upload
    expression_df.to_parquet("curated/expression.parquet", index=False)
    clinical_df.to_parquet("curated/clinical.parquet", index=False)

    # Also write CSV versions — Parquet is better for the pipeline/Azure
    # (smaller, faster), but CSV opens directly in Tableau with no extra
    # connector or conversion step.
    expression_df.to_csv("curated/expression.csv", index=False)
    clinical_df.to_csv("curated/clinical.csv", index=False)

    # Top-N most-variable genes across cases (by TPM variance) — the
    # standard way to cut a few thousand genes down to the ones that
    # actually differ between patients, for clustering/heatmaps or as the
    # gene list behind the dashboard's gene picker.
    TOP_N_GENES = 100
    top_variable_genes = select_top_variable_genes(expression_df, n=TOP_N_GENES)
    pd.DataFrame({"gene_name": top_variable_genes}).to_csv(
        f"curated/top_{TOP_N_GENES}_variable_genes.csv", index=False
    )

    # Kaplan-Meier curves for every gene a user might pick in the dashboard,
    # written to ONE combined CSV. Tableau filters/parameters switch between
    # genes within this file — no Python re-run needed when the user picks
    # a different gene in the app.
    #
    # Using the top-N most-variable genes here instead of a fixed
    # shortlist — swap in your own list (or pd.unique(expression_df["gene_name"])
    # for every gene) if you want different coverage.
    #
    # strata={} -> Overall curves only (plus n / median survival / p-value
    # columns). To also get Stage / Age / Sex subgroup curves, drop the
    # strata argument and filter the `subgroup` column in Tableau.
    genes_of_interest = top_variable_genes
    km_df = build_km_curve_table_stratified(expression_df, clinical_df, genes_of_interest, strata={})
    km_df.to_csv("curated/km_curves.csv", index=False)

    # Gene-page tables: summary stats, display text, and patient-level expression
    stats_df, summary_df, patients_df = build_gene_panel_tables(expression_df, clinical_df, genes_of_interest)
    stats_df.to_csv("curated/gene_stats.csv", index=False)
    summary_df.to_csv("curated/gene_summary.csv", index=False)
    patients_df.to_csv("curated/gene_patients.csv", index=False)