import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppointmentStats from "../components/AppointmentStats";
import AdminSidebar from "../components/AdminSidebar";
import HamburgerButton from "../components/HamburgerButton";

const AppointmentStatsPage = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  return (
    <div className="flex bg-[#fdf8f4] min-h-screen overflow-x-hidden relative">
      <HamburgerButton
        isOpen={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      <AdminSidebar
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <main className="w-full min-h-screen px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <AppointmentStats />
        </div>
      </main>
    </div>
  );
};

export default AppointmentStatsPage;





