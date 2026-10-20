import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardLayout } from "./components/DashboardLayout";
import { OverviewView } from "./components/views/OverviewView";
import { BedManagementView } from "./components/views/BedManagementView";
import { AppointmentsView } from "./components/views/AppointmentsView";
import { DoctorsView } from "./components/views/DoctorsView";
import { TreatmentsView } from "./components/views/TreatmentsView";
import { PatientsView } from "./components/views/PatientsView";
import { RevenueView } from "./components/views/RevenueView";

type UserRole = "pi" | "clinician" | "analyst";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("pi");
  const [currentView, setCurrentView] = useState("overview");

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentView("overview");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("pi");
    setCurrentView("overview");
  };

  const renderView = () => {
    switch (currentView) {
      case "overview": return <OverviewView />;
      case "cohort": return <BedManagementView />;
      case "mutations": return <AppointmentsView />;
      case "survival": return <DoctorsView />;
      case "expression": return <TreatmentsView />;
      case "clinical": return <PatientsView />;
      case "sources": return <RevenueView />;
      default: return <OverviewView />;
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      onLogout={handleLogout}
      userRole={userRole}
    >
      {renderView()}
    </DashboardLayout>
  );
}
