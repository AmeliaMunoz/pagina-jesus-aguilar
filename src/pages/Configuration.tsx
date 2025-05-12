import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AvailabilityPanel from "../components/AvailabilityPanel";
import WeeklySchedulePanel from "../components/WeeklySchedulePanel";
import AdminLayout from "../layouts/AdminLayout";

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState<"disponibilidad" | "horarios">("disponibilidad");
  const location = useLocation();

  useEffect(() => {
    setActiveTab("disponibilidad");
  }, [location.pathname]);

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto mt-10 px-4">
        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-6 text-center md:text-left">
            Configuración de disponibilidad
          </h2>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("disponibilidad")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "disponibilidad"
                  ? "bg-[#b89b71] text-white"
                  : "bg-white border border-[#c8b29d] text-[#5f4b32]"
              }`}
            >
              Disponibilidad específica
            </button>
            <button
              onClick={() => setActiveTab("horarios")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === "horarios"
                  ? "bg-[#b89b71] text-white"
                  : "bg-white border border-[#c8b29d] text-[#5f4b32]"
              }`}
            >
              Horarios semanales
            </button>
          </div>

          {activeTab === "disponibilidad" && (
            <section id="disponibilidad" className="space-y-6">
              <h3 className="text-lg font-semibold text-[#5f4b32]"></h3>
              <AvailabilityPanel />
            </section>
          )}

          {activeTab === "horarios" && (
            <section id="horarios" className="space-y-6">
              <h3 className="text-lg font-semibold text-[#5f4b32]"></h3>
              <WeeklySchedulePanel />
            </section>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Configuracion;






