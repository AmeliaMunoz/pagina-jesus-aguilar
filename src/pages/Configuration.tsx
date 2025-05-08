import AdminSidebar from "../components/AdminSidebar";
import AvailabilityPanel from "../components/AvailabilityPanel";
import WeeklySchedulePanel from "../components/WeeklySchedulePanel";

const Configuracion = () => {
  return (
    <div className="flex bg-[#fdf8f4] min-h-screen scroll-smooth">
      <AdminSidebar />

      <main className="flex-1 ml-64 px-4 sm:px-6 py-8 sm:py-12 space-y-16">
        <section id="disponibilidad">
          <AvailabilityPanel />
        </section>

        <section id="horarios">
          <WeeklySchedulePanel />
        </section>
      </main>
    </div>
  );
};

export default Configuracion;



