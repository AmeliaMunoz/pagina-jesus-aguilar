import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AppointmentCalendar from "../components/AppointmentCalendar";
import HamburgerButton from "../components/HamburgerButton";
import { useLocation } from "react-router-dom";

const AppointmentsPage = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false); // Cierra sidebar al navegar
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

      <main className="w-full min-h-screen px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6 text-center md:text-left">
            Calendario de citas
          </h2>
          <AppointmentCalendar />
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;




