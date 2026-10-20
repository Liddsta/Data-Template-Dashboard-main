/**
 * Single source of truth for the dashboard's Tableau Public panels.
 *
 * Each slot owns its heading and its source worksheet together, so a panel can
 * never render real data under a heading describing a different chart. Views
 * just declare `<VizPanel slot="..." />`.
 *
 * Source workbook: https://public.tableau.com/app/profile/kian.liddy/viz/LiverDashboardVoz
 *
 * To add a panel: publish the worksheet in that workbook, then add a slot here
 * with the worksheet's name exactly as it appears in Tableau.
 */

export type VizSlot =
  // Overview
  | "overview-summary-table"
  // Cohort Analysis
  | "cohort-makeup-overall"
  | "cohort-makeup-age"
  | "cohort-makeup-sex"
  // Survival Analysis
  | "survival-kaplan-meier"
  // Gene Expression
  | "expression-histogram"
  // Clinical Data
  | "clinical-expression-stage"
  | "clinical-expression-age"
  | "clinical-expression-sex";

export interface VizSlotDef {
  /** Heading shown above the panel. */
  title: string;
  description?: string;
  /** Worksheet name exactly as it appears in the Tableau workbook. */
  sheet: string;
  /** Data filters, from the embed code's `<param name='filter' value='a=b' />`. */
  filters?: Record<string, string>;
  /**
   * Explicit viewport height in px. Set this when the sheet's natural content is
   * much shorter than the default 4:3 box, which at full page width is ~800px
   * tall and leaves a small sheet stranded in whitespace.
   */
  height?: number;
  /** Min height of the default 4:3 viewport. Ignored when `height` is set. */
  minHeight?: string;
}

/** Shared by the three Cohort Analysis panels so they render identically sized. */
const COHORT_PANEL_HEIGHT = 480;

export const vizSlots: Record<VizSlot, VizSlotDef> = {
  // A seven-row table — the 4:3 default would strand it in whitespace.
  "overview-summary-table": {
    title: "Cohort Summary",
    description: "Headline counts and summary measures across the liver cohort.",
    sheet: "Summary Table",
    height: 340,
  },

  // The three cohort panels share one height so they occupy equal space.
  "cohort-makeup-overall": {
    title: "High vs Low Cohort Makeup",
    description: "Composition of the high- and low-expression cohorts.",
    sheet: "High vs low cohort makeup",
    height: COHORT_PANEL_HEIGHT,
  },
  "cohort-makeup-age": {
    title: "Cohort Makeup by Age Band",
    description: "High- vs low-expression cohort composition broken down by age band.",
    sheet: "High vs low cohort makeup age bands",
    height: COHORT_PANEL_HEIGHT,
  },
  "cohort-makeup-sex": {
    title: "Cohort Makeup by Sex",
    description: "High- vs low-expression cohort composition broken down by sex.",
    sheet: "High vs low cohort makeup sex",
    height: COHORT_PANEL_HEIGHT,
  },

  "survival-kaplan-meier": {
    title: "Kaplan-Meier Survival Curves",
    description: "Survival curves stratified by expression cohort, with a gene selector.",
    sheet: "Kaplan Meier",
  },

  "expression-histogram": {
    title: "Expression Distribution",
    description: "Distribution of expression values across the cohort, with the high/low split.",
    sheet: "Expression Histogram",
  },

  "clinical-expression-stage": {
    title: "Expression by Stage",
    description: "Expression distribution across clinical stage groups.",
    sheet: "Expression by clinical group stages",
  },
  "clinical-expression-age": {
    title: "Expression by Age Band",
    description: "Expression distribution across age bands.",
    sheet: "Expression by clinical group age bands",
  },
  "clinical-expression-sex": {
    title: "Expression by Sex",
    description: "Expression distribution by sex.",
    sheet: "Expression by clinical group sex",
  },
};

const TABLEAU_HOST = "https://public.tableau.com";

/** URL name of the published workbook. */
const WORKBOOK = "LiverDashboardVoz";

/**
 * Tableau Public builds view URLs by stripping whitespace from the workbook and
 * worksheet names while preserving case — "Dashboard 1" becomes "Dashboard1".
 */
const sheetPath = (sheet: string) => `views/${WORKBOOK}/${sheet.replace(/\s+/g, "")}`;

/**
 * Tableau's embed params are colon-prefixed and must stay literal, so the query
 * string is assembled by hand rather than via URLSearchParams (which would
 * percent-encode the colons).
 */
const EMBED_PARAMS = [
  ":embed=y",
  ":showVizHome=no",
  ":toolbar=yes",
  // The workbook is published with tabs, so without this every panel would
  // render the full tab strip and let viewers navigate away from the sheet
  // that panel is supposed to show.
  ":tabs=no",
  ":display_count=n",
  ":origin=viz_share_link",
  ":language=en-GB",
  // Force the desktop layout; the mobile layout renders ~2000px tall and would
  // be clipped inside a dashboard panel.
  ":device=desktop",
].join("&");

/** URL for the <iframe> that renders the viz inside the dashboard. */
export function tableauEmbedUrl(def: VizSlotDef): string {
  // Filter params carry no colon prefix, and their values must be encoded so
  // field names or values containing spaces survive the round trip.
  const filters = Object.entries(def.filters ?? {}).map(
    ([field, value]) => `${encodeURIComponent(field)}=${encodeURIComponent(value)}`,
  );
  const query = [EMBED_PARAMS, ...filters].join("&");
  return `${TABLEAU_HOST}/${sheetPath(def.sheet)}?${query}`;
}

/** Canonical URL for opening the worksheet on Tableau Public in a new tab. */
export function tableauViewUrl(def: VizSlotDef): string {
  return `${TABLEAU_HOST}/${sheetPath(def.sheet)}`;
}
