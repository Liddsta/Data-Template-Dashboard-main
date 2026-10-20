import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { Layers, Zap, Target, TrendingDown, AlertTriangle } from "lucide-react";
import { topMutatedGenes, mutationTypes, snvClassification, mutationBurdenByStage, cohortStats } from "../../data/genomicsData";
import { SampleDataBadge } from "../SampleDataBadge";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  fontFamily: "JetBrains Mono, monospace",
};

const TYPE_COLORS: Record<string, string> = { TSG: "#f43f5e", Oncogene: "#0ea5e9", Other: "#8b5cf6" };

export function AppointmentsView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-semibold text-foreground">Mutation Landscape</h2>
          <SampleDataBadge />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Somatic mutation profiles, variant classifications, and tumor mutational burden.
        </p>
      </div>

      {/* The workbook holds no mutation data, so nothing on this tab is live. */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900/80 leading-relaxed">
          Every figure on this tab is template placeholder data. The Liver Dashboard workbook
          contains expression, survival, stage, sex and age data only &mdash; it has no mutation
          calls, so none of these numbers describe the {cohortStats.totalCases}-patient cohort.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Somatic Mutations", value: cohortStats.totalMutations.toLocaleString(), icon: <Layers className="w-4 h-4 text-blue-600" />, bg: "bg-blue-600/10" },
          { label: "Median TMB", value: `${cohortStats.tmb} mut/Mb`, icon: <Target className="w-4 h-4 text-sky-400" />, bg: "bg-sky-500/15" },
          { label: "Top Driver Gene", value: "TP53 (31.3%)", icon: <Zap className="w-4 h-4 text-violet-400" />, bg: "bg-violet-500/15" },
          { label: "Missense Rate", value: "68.2%", icon: <TrendingDown className="w-4 h-4 text-rose-400" />, bg: "bg-rose-500/15" },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} mb-3`}>{icon}</div>
            <p className="text-xl font-semibold text-foreground font-mono">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top mutated genes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Driver Gene Frequency</h3>
              <p className="text-xs text-muted-foreground mt-0.5">% of LIHC cases mutated</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {type}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={topMutatedGenes.map((g) => ({ ...g, fill: TYPE_COLORS[g.type] ?? "#6b7fa3" }))}
              margin={{ left: -10, right: 10, top: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
              <XAxis dataKey="gene" tick={{ fill: "#0f172a", fontSize: 10, fontFamily: "JetBrains Mono" }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Frequency"]} />
              <Bar dataKey="frequency" radius={[3, 3, 0, 0]} maxBarSize={36}>
                {topMutatedGenes.map((g, i) => (
                  <Cell key={`gene-${i}`} fill={TYPE_COLORS[g.type] ?? "#6b7fa3"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mutation types donut + SNV */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Variant Classification</h3>
            <div className="flex items-center gap-2 mb-2">
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie data={mutationTypes} dataKey="count" cx="50%" cy="50%" innerRadius={24} outerRadius={42} strokeWidth={0}>
                    {mutationTypes.map((entry, i) => (
                      <Cell key={`vc-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {mutationTypes.map((mt) => (
                  <div key={mt.type} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: mt.color }} />
                      {mt.type}
                    </span>
                    <span className="text-xs font-mono text-foreground">{mt.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TMB by stage */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Median TMB by Stage</h3>
            <div className="space-y-2">
              {mutationBurdenByStage.map((s, i) => {
                const colors = ["#10b981", "#f59e0b", "#f97316", "#f43f5e"];
                const maxTmb = 5;
                return (
                  <div key={s.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-muted-foreground">{s.stage}</span>
                      <span className="font-mono text-foreground">{s.tmb} mut/Mb</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(s.tmb / maxTmb) * 100}%`, background: colors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SNV classification */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">SNV Base Change Classification</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {snvClassification.map((s) => (
            <div key={s.class} className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-lg font-semibold font-mono text-foreground">{s.percentage}%</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.class}</p>
              <p className="text-xs font-mono text-muted-foreground/60 mt-1">{s.count.toLocaleString()} events</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
