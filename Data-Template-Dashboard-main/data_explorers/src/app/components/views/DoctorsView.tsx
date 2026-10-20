import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, Users, AlertCircle } from "lucide-react";
import { survivalByStage, summaryStats, stageDistribution } from "../../data/genomicsData";
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

const stageColors = {
  stageI: "#10b981",
  stageII: "#f59e0b",
  stageIII: "#f97316",
  stageIV: "#f43f5e",
};

const stageLabels = {
  stageI: "Stage I",
  stageII: "Stage II",
  stageIII: "Stage III",
  stageIV: "Stage IV",
};

const survival5yr: Record<string, string> = {
  stageI: "60.2%",
  stageII: "38.9%",
  stageIII: "23.5%",
  stageIV: "6.9%",
};

export function DoctorsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Survival Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Survival for the {summaryStats.patientsTotal} patients ({summaryStats.patientsHigh} high / {summaryStats.patientsLow} low expression). The tiles below are fixed <span className="font-mono">{summaryStats.gene}</span> figures; the Kaplan-Meier panel has its own gene dropdown, so switching it there will not update them. Use the Gene Explorer tab for a fully linked view.
        </p>
      </div>

      {/* Key survival stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Median Survival, High · ${summaryStats.gene}`, value: `${summaryStats.medianSurvivalHighMonths} mo`, color: "text-blue-600", bg: "bg-blue-600/10" },
          { label: `Median Survival, Low · ${summaryStats.gene}`, value: `${summaryStats.medianSurvivalLowMonths} mo`, color: "text-sky-400", bg: "bg-sky-500/15" },
          { label: `Hazard Ratio, High vs Low · ${summaryStats.gene}`, value: `${summaryStats.hazardRatio}`, color: "text-violet-400", bg: "bg-violet-500/15" },
          { label: `Log-rank p-value · ${summaryStats.gene}`, value: `${summaryStats.logRankP}`, color: "text-muted-foreground", bg: "bg-muted" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} mb-3`}>
              <TrendingUp className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-semibold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* KM Curves PowerBI placeholder */}
      <VizPanel slot="survival-kaplan-meier" />

      {/* Simulated survival area chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">Estimated Overall Survival by Stage</h3>
              <SampleDataBadge />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Simulated KM estimates — 60-month follow-up</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {Object.entries(stageLabels).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-8 h-0.5 rounded-full inline-block" style={{ background: stageColors[key as keyof typeof stageColors] }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={survivalByStage} margin={{ left: -5, right: 20, top: 10, bottom: 0 }}>
            <defs>
              {Object.entries(stageColors).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickFormatter={(v) => `${v}m`}
              label={{ value: "Months", position: "insideBottomRight", offset: -10, fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, stageLabels[name as keyof typeof stageLabels] ?? name]}
              labelFormatter={(l) => `Month ${l}`}
            />
            {Object.keys(stageColors).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={stageColors[key as keyof typeof stageColors]}
                strokeWidth={2}
                fill={`url(#grad-${key})`}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 5-year survival table */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <h3 className="text-sm font-semibold text-foreground">5-Year Survival by Stage</h3>
          <SampleDataBadge />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left text-xs font-mono text-muted-foreground pb-2 font-normal">Stage</th>
              <th className="text-right text-xs font-mono text-muted-foreground pb-2 font-normal">N</th>
              <th className="text-right text-xs font-mono text-muted-foreground pb-2 font-normal">Median OS</th>
              <th className="text-right text-xs font-mono text-muted-foreground pb-2 font-normal">5-yr OS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {stageDistribution.map((s, i) => {
              const keys = ["stageI", "stageII", "stageIII", "stageIV"] as const;
              const key = keys[i];
              const medians = [78, 52, 34, 14];
              return (
                <tr key={s.stage}>
                  <td className="py-2.5 font-mono text-xs text-foreground">{s.stage}</td>
                  <td className="py-2.5 font-mono text-xs text-muted-foreground text-right">{s.count}</td>
                  <td className="py-2.5 font-mono text-xs text-muted-foreground text-right">{medians[i]} mo</td>
                  <td className="py-2.5 font-mono text-xs text-right font-semibold" style={{ color: stageColors[key] }}>
                    {survival5yr[key]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/50 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Per-stage survival figures in this table are simulated template values, not from the Liver Dashboard workbook. For <span className="font-mono">{summaryStats.gene}</span>, the actual high-vs-low comparison is not significant: HR {summaryStats.hazardRatio} (95% CI {summaryStats.hazardRatioCI}), log-rank p = {summaryStats.logRankP}, FDR-adjusted p = {summaryStats.fdrAdjustedP}.
          </p>
        </div>
      </div>
    </div>
  );
}
