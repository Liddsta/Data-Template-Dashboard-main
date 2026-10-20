import { Microscope, TrendingUp, TrendingDown, Dna } from "lucide-react";
import { summaryStats } from "../../data/genomicsData";
import { VizPanel } from "../VizPanel";

export function TreatmentsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Gene Expression</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Expression across {summaryStats.patientsTotal} patients, split at the median into high- and low-expression groups.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Patients", value: `${summaryStats.patientsTotal}`, icon: <Microscope className="w-4 h-4 text-blue-600" />, bg: "bg-blue-600/10" },
          { label: "High Expression", value: `${summaryStats.patientsHigh}`, icon: <TrendingUp className="w-4 h-4 text-blue-600" />, bg: "bg-blue-600/10" },
          { label: "Low Expression", value: `${summaryStats.patientsLow}`, icon: <TrendingDown className="w-4 h-4 text-sky-400" />, bg: "bg-sky-500/15" },
          { label: "Median Expression", value: `${summaryStats.medianExpressionTpm} TPM`, icon: <Dna className="w-4 h-4 text-violet-400" />, bg: "bg-violet-500/15" },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} mb-3`}>{icon}</div>
            <p className="text-xl font-semibold text-foreground font-mono">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Expression distribution */}
      <VizPanel slot="expression-histogram" />
    </div>
  );
}
