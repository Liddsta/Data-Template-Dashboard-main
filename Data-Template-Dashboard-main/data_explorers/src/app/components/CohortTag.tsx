/**
 * States which cohort a figure counts. Two real cohorts are in play and they
 * must never be read as one number:
 *   n=414 — the full TCGA-LIHC extract in /Data
 *   n=388 — the subset the Tableau workbook analysed (expression + survival)
 */
export function CohortTag({ n, label }: { n: 414 | 388 | number; label?: string }) {
  return (
    <span
      title={
        n === 388
          ? "The 388 cases with both expression and survival data (Tableau workbook)"
          : "The full 414-case TCGA-LIHC extract"
      }
      className="inline-flex items-center flex-shrink-0 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-600/10 text-blue-700 border border-blue-600/25"
    >
      n={n.toLocaleString()}
      {label ? ` · ${label}` : ""}
    </span>
  );
}
