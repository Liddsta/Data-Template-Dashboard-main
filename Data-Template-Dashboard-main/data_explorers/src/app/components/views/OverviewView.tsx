import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Users, Activity, TrendingUp, Dna, Clock, Target } from "lucide-react";
import { cohortStats, summaryStats, gdcCohort, topMutatedGenes, stageDistribution, stageNotReported, mutationTypes } from "../../data/genomicsData";
import { VizPanel } from "../VizPanel";
import { SampleDataBadge } from "../SampleDataBadge";
import { CohortTag } from "../CohortTag";

const GENE_COLORS: Record<string, string> = {
  TSG: "#f43f5e",
  Oncogene: "#0ea5e9",
  Other: "#8b5cf6",
};

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  fontFamily: "JetBrains Mono, monospace",
};

function StatCard({ label, value, sub, icon, accent, sample }: { label: string; value: string; sub: string; icon: React.ReactNode; accent?: string; sample?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ?? "bg-blue-600/10"}`}>
          {icon}
        </div>
        {sample && <SampleDataBadge />}
      </div>
      <p className="text-2xl font-semibold text-foreground font-mono">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{sub}</p>
    </div>
  );
}

export function OverviewView() {
  const geneData = topMutatedGenes.slice(0, 10).map((g) => ({ ...g, fill: GENE_COLORS[g.type] ?? "#6b7fa3" }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Liver Hepatocellular Carcinoma
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {gdcCohort.totalCases} cases in the GDC extract · {summaryStats.patientsTotal} with expression + survival ({summaryStats.patientsHigh} high / {summaryStats.patientsLow} low)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md bg-muted text-muted-foreground border border-border">
          <span>Source · Liver Dashboard Voz</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Cases"
          value={gdcCohort.totalCases.toLocaleString()}
          sub={`GDC extract · ${cohortStats.totalCases} analysed`}
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          label="Genes Sequenced"
          value={cohortStats.totalGenes.toLocaleString()}
          sub="WGS + targeted"
          icon={<Dna className="w-4 h-4 text-blue-600" />}
          sample
        />
        <StatCard
          label="Median Survival"
          value={`${summaryStats.medianSurvivalHighMonths} / ${summaryStats.medianSurvivalLowMonths} mo`}
          sub="High / low expression"
          icon={<Clock className="w-4 h-4 text-sky-400" />}
          accent="bg-sky-500/15"
        />
        <StatCard
          label="Hazard Ratio"
          value={`${summaryStats.hazardRatio}`}
          sub={`95% CI ${summaryStats.hazardRatioCI}`}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          accent="bg-emerald-500/15"
        />
        <StatCard
          label="Somatic Mutations"
          value={cohortStats.totalMutations.toLocaleString()}
          sub="Total detected"
          icon={<Activity className="w-4 h-4 text-violet-400" />}
          accent="bg-violet-500/15"
          sample
        />
        <StatCard
          label="Median TMB"
          value={`${cohortStats.tmb}`}
          sub="Mut / Mb"
          icon={<Target className="w-4 h-4 text-rose-400" />}
          accent="bg-rose-500/15"
          sample
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top mutated genes */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground">Top Mutated Genes</h3>
                <SampleDataBadge />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">% of cases with somatic mutation</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {Object.entries(GENE_COLORS).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                  {type}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={geneData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7fa3", fontSize: 11, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="gene" tick={{ fill: "#0f172a", fontSize: 11, fontFamily: "JetBrains Mono" }} width={60} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, "Frequency"]}
              />
              <Bar dataKey="frequency" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {geneData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stage + mutation type */}
        <div className="space-y-4">
          {/* Stage distribution */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-foreground">Stage Distribution</h3>
              <CohortTag n={gdcCohort.stagedCases} label="staged" />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              AJCC pathologic stage · {stageNotReported} of {gdcCohort.totalCases} unstaged
            </p>
            <div className="space-y-2">
              {stageDistribution.map((s, i) => {
                const colors = ["#2563eb", "#0ea5e9", "#8b5cf6", "#f43f5e"];
                return (
                  <div key={s.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-muted-foreground">{s.stage}</span>
                      <span className="font-mono text-foreground">{s.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${s.percentage}%`, background: colors[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mutation types donut */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <h3 className="text-sm font-semibold text-foreground">Mutation Types</h3>
              <SampleDataBadge />
            </div>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={80} height={80}>
                <PieChart>
                  <Pie data={mutationTypes} dataKey="count" cx="50%" cy="50%" innerRadius={22} outerRadius={38} strokeWidth={0}>
                    {mutationTypes.map((entry, i) => (
                      <Cell key={`mt-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {mutationTypes.slice(0, 4).map((mt) => (
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
        </div>
      </div>

      {/* Tableau Public slot */}
      <VizPanel slot="overview-summary-table" />
    </div>
  );
}
