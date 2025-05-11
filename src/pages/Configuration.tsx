import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AvailabilityPanel from "../components/AvailabilityPanel";
import WeeklySchedulePanel from "../components/WeeklySchedulePanel";
import HamburgerButton from "../components/HamburgerButton";

const Configuracion = () => {
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

      <main className="w-full min-h-screen px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center space-y-16">
        <section id="disponibilidad" className="w-full max-w-5xl">
          <AvailabilityPanel />
        </section>

        <section id="horarios" className="w-full max-w-5xl">
          <WeeklySchedulePanel />
        </section>
      </main>
    </div>
  );
};

export default Configuracion;





