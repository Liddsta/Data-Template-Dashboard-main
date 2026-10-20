import { useState } from "react";
import { summaryStats, gdcCohort } from "../data/genomicsData";
import {
  LayoutDashboard,
  Users,
  Layers,
  TrendingUp,
  Microscope,
  FileText,
  Database,
  SlidersHorizontal,
  Dna,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";

type UserRole = "pi" | "clinician" | "analyst";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, roles: ["pi", "clinician", "analyst"] },
  { id: "cohort", label: "Cohort Analysis", icon: <Users className="w-4 h-4" />, roles: ["pi", "analyst"] },
  { id: "mutations", label: "Mutation Landscape", icon: <Layers className="w-4 h-4" />, roles: ["pi", "analyst"] },
  { id: "survival", label: "Survival Analysis", icon: <TrendingUp className="w-4 h-4" />, roles: ["pi", "clinician"] },
  { id: "expression", label: "Gene Expression", icon: <Microscope className="w-4 h-4" />, roles: ["pi", "analyst"] },
  { id: "clinical", label: "Clinical Data", icon: <FileText className="w-4 h-4" />, roles: ["pi", "clinician"] },
  { id: "explorer", label: "Gene Explorer", icon: <SlidersHorizontal className="w-4 h-4" />, roles: ["pi", "clinician", "analyst"] },
  { id: "sources", label: "Data Sources", icon: <Database className="w-4 h-4" />, roles: ["pi", "analyst"] },
];

const roleLabels: Record<UserRole, string> = {
  pi: "Principal Investigator",
  clinician: "Clinician",
  analyst: "Data Analyst",
};

const viewLabels: Record<string, string> = {
  overview: "Overview",
  cohort: "Cohort Analysis",
  mutations: "Mutation Landscape",
  survival: "Survival Analysis",
  expression: "Gene Expression",
  clinical: "Clinical Data",
  explorer: "Gene Explorer",
  sources: "Data Sources",
};

interface Props {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userRole: UserRole;
}

export function DashboardLayout({ children, currentView, onViewChange, onLogout, userRole }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accessible = navItems.filter((item) => item.roles.includes(userRole));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
            <Dna className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">GDC Explorer</p>
            <p className="text-xs text-muted-foreground mt-0.5">TCGA-LIHC · Liver</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <p className="px-2 mb-2 text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">Modules</p>
        {accessible.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-100 ${
                active
                  ? "bg-blue-600/10 text-blue-600 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100"
              }`}
            >
              <span className={active ? "text-blue-600" : "text-muted-foreground"}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-blue-600/50" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-600/25 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-blue-600">
              {userRole === "pi" ? "PI" : userRole === "clinician" ? "CL" : "DA"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{roleLabels[userRole]}</p>
            <p className="text-xs text-muted-foreground">Authorized access</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex flex-col w-56 bg-sidebar border-r border-border/50 flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-sidebar border-r border-border/50 flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground">{viewLabels[currentView]}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Liver Hepatocellular Carcinoma · {gdcCohort.totalCases}-case GDC extract · {summaryStats.patientsTotal} analysed
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </main>
      </div>
    </div>
  );
}
