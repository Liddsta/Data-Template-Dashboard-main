/**
 * Marks a surface whose figures are template placeholder data rather than the
 * Liver Dashboard workbook. See the SAMPLE DATA divider in data/genomicsData.ts
 * for which datasets this applies to.
 */
export function SampleDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Template placeholder figures — not from the Liver Dashboard workbook"
      className={`inline-flex items-center flex-shrink-0 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/30 ${className}`}
    >
      Sample data
    </span>
  );
}
