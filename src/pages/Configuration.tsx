import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AvailabilityPanel from "../components/AvailabilityPanel";
import WeeklySchedulePanel from "../components/WeeklySchedulePanel";
import AdminLayout from "../layouts/AdminLayout";

const Configuracion = () => {
  const [_, setSidebarVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10 space-y-16">
        <section id="disponibilidad" className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#5f4b32]">Disponibilidad específica</h2>
          <AvailabilityPanel />
        </section>

        <section id="horarios" className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#5f4b32]">Horarios semanales</h2>
          <WeeklySchedulePanel />
        </section>
      </div>
    </AdminLayout>
  );
};

export default Configuracion;






