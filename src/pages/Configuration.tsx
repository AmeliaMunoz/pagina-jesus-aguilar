import AdminHeader from "../components/AdminHeader";
import AvailabilityPanel from "../components/AvailabilityPanel";
import WeeklySchedulePanel from "../components/WeeklySchedulePanel";
import { useNavigate } from "react-router-dom";

const Configuracion = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin-autenticado");
    navigate("/admin");
  };

  return (
    <div className="bg-[#fdf8f4] min-h-screen scroll-smooth">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
        <section id="disponibilidad">
          <AvailabilityPanel />
        </section>

        <section id="horarios">
          <WeeklySchedulePanel />
        </section>
      </div>
    </div>
  );
};

export default Configuracion;


