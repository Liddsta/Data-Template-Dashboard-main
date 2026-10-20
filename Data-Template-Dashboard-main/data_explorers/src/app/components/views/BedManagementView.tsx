import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Users, UserCheck, UserX, Activity } from "lucide-react";
import {
  ageDistribution, ageNotReported, riskFactors, genderDistribution, tumorGradeDistribution, stageDistribution, cohortStats,
} from "../../data/genomicsData";
import { VizPanel } from "../VizPanel";
import { SampleDataBadge } from "../SampleDataBadge";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  fontFamily: "JetBrains Mono, monospace",
};

export function BedManagementView() {
  const malePercent = ((genderDistribution.male / cohortStats.totalCases) * 100).toFixed(1);
  const femalePercent = ((genderDistribution.female / cohortStats.totalCases) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Cohort Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Demographic breakdown, risk factor prevalence, and tumor characteristics across {cohortStats.totalCases} patients.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Median Age", value: `${cohortStats.medianAge} yr`, icon: <Activity className="w-4 h-4 text-blue-600" />, bg: "bg-blue-600/10", sample: true },
          { label: "Male Cases", value: `${genderDistribution.male} (${malePercent}%)`, icon: <Users className="w-4 h-4 text-sky-400" />, bg: "bg-sky-500/15", sample: false },
          { label: "Female Cases", value: `${genderDistribution.female} (${femalePercent}%)`, icon: <UserCheck className="w-4 h-4 text-violet-400" />, bg: "bg-violet-500/15", sample: false },
          { label: "Cirrhosis Rate", value: "42.0%", icon: <UserX className="w-4 h-4 text-rose-400" />, bg: "bg-rose-500/15", sample: true },
        ].map(({ label, value, icon, bg, sample }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
              {sample && <SampleDataBadge />}
            </div>
            <p className="text-xl font-semibold text-foreground font-mono">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Cohort makeup — three equally sized panels, each full width so the
          embedded Tableau sheet is never squeezed into a part-width column. */}
      <VizPanel slot="cohort-makeup-overall" />
      <VizPanel slot="cohort-makeup-age" />
      <VizPanel slot="cohort-makeup-sex" />

      {/* Age distribution */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Age at Diagnosis</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {ageDistribution.reduce((a, b) => a + b.count, 0)} patients with an age band recorded; {ageNotReported} not reported
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ageDistribution} margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
            <XAxis dataKey="range" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Cases"]} />
            <Bar dataKey="count" fill="#f59e0b" fillOpacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk factors + Tumor grade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk factors */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-foreground">Risk Factor Prevalence</h3>
            <SampleDataBadge />
          </div>
          <p className="text-xs text-muted-foreground mb-4">% of cohort with each condition</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskFactors} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="factor" tick={{ fill: "#0f172a", fontSize: 11, fontFamily: "JetBrains Mono" }} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Prevalence"]} />
              <Bar dataKey="percentage" fill="#0ea5e9" fillOpacity={0.8} radius={[0, 3, 3, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tumor grade table */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-foreground">Tumor Grade Distribution</h3>
            <SampleDataBadge />
          </div>
          <p className="text-xs text-muted-foreground mb-4">WHO histological grading</p>
          <div className="space-y-3">
            {tumorGradeDistribution.map((g, i) => {
              const colors = ["#10b981", "#f59e0b", "#f97316", "#f43f5e"];
              return (
                <div key={g.grade}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted-foreground">{g.grade}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{g.count} cases</span>
                      <span className="text-xs font-mono text-foreground w-10 text-right">{g.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${g.percentage}%`, background: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stage mini breakdown */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">AJCC Pathologic Stage</p>
            <div className="grid grid-cols-4 gap-2">
              {stageDistribution.map((s, i) => {
                const colors = ["#f59e0b", "#0ea5e9", "#8b5cf6", "#f43f5e"];
                return (
                  <div key={s.stage} className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-semibold font-mono" style={{ color: colors[i] }}>{s.count}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.stage.replace("Stage ", "")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
