import { Database, FileArchive, Globe, Lock, ExternalLink, Server } from "lucide-react";
import { datasetMetrics, cohortStats } from "../../data/genomicsData";
import { SampleDataBadge } from "../SampleDataBadge";

const dataTypes = [
  { type: "Whole-Genome Sequencing (WGS)", files: datasetMetrics.wgsFiles, format: "BAM / VCF", size: "15.2 TB" },
  { type: "RNA-Seq (mRNA expression)", files: datasetMetrics.rnaSeqFiles, format: "FASTQ / HTSeq", size: "2.1 TB" },
  { type: "DNA Methylation (450k array)", files: datasetMetrics.methylationFiles, format: "IDAT / TSV", size: "940 GB" },
  { type: "Clinical & Follow-Up", files: datasetMetrics.clinicalFiles, format: "TSV / XML", size: "142 MB" },
];

const repositories = [
  { name: "GDC Data Portal", url: "portal.gdc.cancer.gov", description: "Primary access point for all TCGA file downloads and case-level queries." },
  { name: "cBioPortal", url: "cbioportal.org", description: "Curated processed data with built-in mutation and survival visualizations." },
  { name: "UCSC Xena", url: "xenabrowser.net", description: "Pan-cancer genomic datasets with matrix download and browser access." },
  { name: "dbGaP", url: "ncbi.nlm.nih.gov/gap", description: "Controlled access approval for individual-level sequencing reads." },
];

export function RevenueView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-semibold text-foreground">Data Sources</h2>
          <SampleDataBadge />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Dataset provenance, file inventories, and access policies. All figures on this tab are template placeholder values &mdash; the Liver Dashboard workbook carries no file inventory or access metadata.
        </p>
      </div>

      {/* Dataset identity card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">TCGA-LIHC</h3>
              <p className="text-sm text-muted-foreground">The Cancer Genome Atlas — Liver Hepatocellular Carcinoma</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-emerald-400">Open-access summary data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Program", value: "TCGA" },
            { label: "Project ID", value: "TCGA-LIHC" },
            { label: "Primary Site", value: "Liver" },
            { label: "Disease", value: "HCC" },
            { label: "Data Release", value: "v38.0" },
            { label: "Release Date", value: cohortStats.releaseDate },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* File inventory */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileArchive className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-foreground">File Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {["Data Type", "Files", "Format", "Approx. Size"].map((h) => (
                  <th key={h} className="text-left text-xs font-mono text-muted-foreground pb-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {dataTypes.map((d) => (
                <tr key={d.type} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-xs text-foreground">{d.type}</td>
                  <td className="py-3 font-mono text-xs text-blue-600">{d.files}</td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">{d.format}</td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">{d.size}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border/60">
                <td className="pt-3 text-xs font-semibold text-foreground">Total</td>
                <td className="pt-3 font-mono text-xs text-blue-600 font-semibold">
                  {datasetMetrics.wgsFiles + datasetMetrics.rnaSeqFiles + datasetMetrics.methylationFiles + datasetMetrics.clinicalFiles}
                </td>
                <td className="pt-3" />
                <td className="pt-3 font-mono text-xs text-foreground font-semibold">~18.4 TB</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Access policies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-foreground">Access Policy</h3>
          </div>
          <div className="space-y-3">
            {[
              { level: "Open Access", detail: "Summary statistics, aggregate mutation frequencies, processed expression matrices", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
              { level: "Controlled Access", detail: "Individual-level sequencing reads (BAM), raw germline variant data — requires dbGaP approval", badge: "bg-blue-600/8 text-blue-600 border-blue-600/20" },
            ].map(({ level, detail, badge }) => (
              <div key={level} className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <span className={`inline-block text-xs font-mono px-2 py-0.5 rounded border mb-2 ${badge}`}>{level}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p><span className="font-mono text-muted-foreground/70">Grant:</span> {datasetMetrics.grantNumber}</p>
            <p><span className="font-mono text-muted-foreground/70">Primary citation:</span> {datasetMetrics.primaryPublication}</p>
          </div>
        </div>

        {/* External repositories */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-foreground">External Repositories</h3>
          </div>
          <div className="space-y-3">
            {repositories.map((r) => (
              <div key={r.name} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 hover:border-border transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-mono text-blue-600/70 mt-0.5">{r.url}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Server info */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-foreground">Data Quality & Provenance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            { key: "Alignment", value: "GRCh38 / hg38 (BWA-MEM)" },
            { key: "Variant calling", value: "MuTect2, VarScan2, SomaticSniper" },
            { key: "Expression quantification", value: "STAR + HTSeq-count" },
            { key: "Normalization", value: "FPKM-UQ (RNA-Seq)" },
            { key: "Copy number", value: "GISTIC2 (SNP6 array)" },
            { key: "QC passed", value: "371 / 377 initial cases" },
          ].map(({ key, value }) => (
            <div key={key} className="flex flex-col gap-1 py-2 border-b border-border/40">
              <span className="font-mono text-muted-foreground/70 uppercase tracking-wide text-xs">{key}</span>
              <span className="text-foreground/80">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
