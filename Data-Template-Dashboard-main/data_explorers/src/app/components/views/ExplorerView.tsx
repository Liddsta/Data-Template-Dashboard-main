import { SlidersHorizontal, Info } from "lucide-react";
import { summaryStats } from "../../data/genomicsData";
import { VizPanel } from "../VizPanel";

/**
 * The one page where the workbook's Gene Parameter is interactive.
 *
 * Every other tab embeds individual worksheets, which inherit the workbook's
 * default gene and have no parameter control of their own. This tab embeds the
 * whole Tableau dashboard, which does carry the control, so switching genes
 * here updates every chart inside this panel at once.
 */
export function ExplorerView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-foreground">Gene Explorer</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          The complete Tableau dashboard, with the Gene Parameter dropdown enabled. Changing the
          gene re-runs the expression split, the cohort makeup and the survival comparison together.
        </p>
      </div>

      <div className="rounded-lg border border-blue-600/25 bg-blue-600/[0.05] px-4 py-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/70 leading-relaxed">
          The gene you pick here applies to this panel only. Every other tab is pinned to the
          workbook default, <span className="font-mono font-medium">MT2A</span> &mdash; including the
          headline statistics (HR {summaryStats.hazardRatio}, log-rank p {summaryStats.logRankP},
          median survival {summaryStats.medianSurvivalHighMonths}/{summaryStats.medianSurvivalLowMonths} months),
          which are MT2A figures and will not follow a change made here.
        </p>
      </div>

      <VizPanel slot="explorer-dashboard" />
    </div>
  );
}
