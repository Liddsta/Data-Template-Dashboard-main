import { useState } from "react";
import { Dna, FlaskConical, BarChart3, ShieldCheck, ChevronRight } from "lucide-react";
import { summaryStats } from "../data/genomicsData";

type UserRole = "pi" | "clinician" | "analyst";

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  access: string[];
}

const roles: RoleOption[] = [
  {
    id: "pi",
    title: "Principal Investigator",
    subtitle: "Full repository access",
    icon: <Dna className="w-5 h-5" />,
    access: ["All modules", "Raw data export", "Admin controls"],
  },
  {
    id: "clinician",
    title: "Clinician",
    subtitle: "Clinical & survival data",
    icon: <FlaskConical className="w-5 h-5" />,
    access: ["Overview", "Survival Analysis", "Clinical Data"],
  },
  {
    id: "analyst",
    title: "Data Analyst",
    subtitle: "Genomic & expression data",
    icon: <BarChart3 className="w-5 h-5" />,
    access: ["Overview", "Mutation Landscape", "Gene Expression", "Cohort Analysis"],
  },
];

interface Props {
  onLogin: (role: UserRole) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("pi");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-border">
        {/* Left panel */}
        <div className="bg-card p-10 flex flex-col justify-between border-r border-border">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-600/25 flex items-center justify-center">
                <Dna className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">GDC Explorer</p>
            </div>

            <h1 className="text-3xl font-semibold text-foreground leading-tight mb-3">
              Cancer Genomics<br />Data Explorer
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Interactive access to large-scale cancer genomics repositories. Explore mutation profiles,
              survival outcomes, and gene expression data without writing a single line of code.
            </p>

            <div className="space-y-0">
              {[
                { label: "Cancer Type", value: "Liver Hepatocellular Carcinoma" },
                { label: "Source", value: "Tableau · Liver Dashboard Voz" },
                { label: "Total Cases", value: `${summaryStats.patientsTotal} patients (${summaryStats.patientsHigh} high / ${summaryStats.patientsLow} low)` },
                { label: "Median Survival", value: `${summaryStats.medianSurvivalHighMonths} / ${summaryStats.medianSurvivalLowMonths} months (high / low)` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-border/60">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
                  <span className="text-xs text-foreground/80">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Controlled access via dbGaP authorization</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-background p-10 flex flex-col justify-center">
          <h2 className="text-lg font-medium text-foreground mb-1">Select access role</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your role determines which modules and data tiers are available.
          </p>

          <div className="space-y-3 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
                  selectedRole === role.id
                    ? "border-blue-600/50 bg-blue-600/5"
                    : "border-border hover:border-border/60 hover:bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                      selectedRole === role.id
                        ? "bg-blue-600/15 text-blue-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {role.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{role.title}</p>
                      {selectedRole === role.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{role.subtitle}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.access.map((item) => (
                        <span
                          key={item}
                          className="inline-block text-xs px-1.5 py-0.5 rounded font-mono bg-muted text-muted-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => onLogin(selectedRole)}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors duration-150"
          >
            Access Data Explorer
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            TCGA-LIHC · GDC Release 38.0 · Controlled access
          </p>
        </div>
      </div>
    </div>
  );
}
