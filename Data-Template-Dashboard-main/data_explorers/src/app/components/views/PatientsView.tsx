import { useState } from "react";
import { Search, FileText, CheckCircle2, XCircle } from "lucide-react";
import { clinicalPatients, cohortStats, gdcCohort } from "../../data/genomicsData";
import { SampleDataBadge } from "../SampleDataBadge";
import { CohortTag } from "../CohortTag";
import { VizPanel } from "../VizPanel";

const stageColors: Record<string, string> = {
  "Stage I": "text-emerald-400",
  "Stage II": "text-blue-600",
  "Stage III": "text-orange-400",
  "Stage IV": "text-rose-400",
};

export function PatientsView() {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  const stages = ["All", "Stage I", "Stage II", "Stage III", "Stage IV"];

  const filtered = clinicalPatients.filter((p) => {
    const matchesQuery = p.caseId.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stageFilter === "All" || p.stage === stageFilter;
    return matchesQuery && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Clinical Data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Expression by clinical group across the {cohortStats.totalCases}-patient cohort. The three panels below are live; the case listing beneath them is template sample data.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Cases (GDC)", value: gdcCohort.totalCases, icon: <FileText className="w-4 h-4 text-blue-600" />, bg: "bg-blue-600/10", sample: false, n: gdcCohort.totalCases },
          { label: "With Survival Data", value: gdcCohort.withSurvivalTime, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/15", sample: false, n: gdcCohort.totalCases },
          { label: "Deceased", value: gdcCohort.deceased, icon: <XCircle className="w-4 h-4 text-rose-400" />, bg: "bg-rose-500/15", sample: false, n: gdcCohort.totalCases },
          { label: "Median AFP (U/L)", value: 142, icon: <FileText className="w-4 h-4 text-sky-400" />, bg: "bg-sky-500/15", sample: true, n: 0 },
        ].map(({ label, value, icon, bg, sample, n }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
              {sample ? <SampleDataBadge /> : <CohortTag n={n} />}
            </div>
            <p className="text-xl font-semibold text-foreground font-mono">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* PowerBI placeholder */}
      <VizPanel slot="clinical-expression-stage" />

      {/* Expression split by demographic group */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VizPanel slot="clinical-expression-age" />
        <VizPanel slot="clinical-expression-sex" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by case ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/30 font-mono"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                stageFilter === s
                  ? "bg-blue-600/10 text-blue-600 border border-blue-600/25"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">Case Listing</h3>
          <SampleDataBadge />
          <span className="text-xs text-muted-foreground">
            Placeholder case records &mdash; the workbook exposes no patient-level clinical table
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {["Case ID", "Age", "Sex", "Stage", "Grade", "Status", "Surv. (days)", "HBV", "HCV", "Alcohol", "AFP (U/L)", "Tumour (cm)"].map((h) => (
                  <th key={h} className="text-left text-xs font-mono text-muted-foreground px-4 py-3 font-normal whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((p) => (
                <tr key={p.caseId} className="hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-600 font-medium whitespace-nowrap">{p.caseId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.age}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.gender}</td>
                  <td className={`px-4 py-2.5 font-mono text-xs font-medium ${stageColors[p.stage] ?? "text-foreground"}`}>{p.stage}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.grade}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono ${p.vitalStatus === "Alive" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {p.vitalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.survivalDays.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <span className={p.hbv ? "text-blue-600" : "text-muted-foreground/40"}>
                      {p.hbv ? "+" : "−"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <span className={p.hcv ? "text-blue-600" : "text-muted-foreground/40"}>
                      {p.hcv ? "+" : "−"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    <span className={p.alcohol ? "text-blue-600" : "text-muted-foreground/40"}>
                      {p.alcohol ? "+" : "−"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.afp != null ? p.afp.toLocaleString() : <span className="text-muted-foreground/40">N/A</span>}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.tumorSize ?? <span className="text-muted-foreground/40">N/A</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">
            Showing {filtered.length} of {clinicalPatients.length} representative cases
          </span>
          <span className="text-xs text-muted-foreground/60">Template sample rows · not from the GDC extract</span>
        </div>
      </div>
    </div>
  );
}
