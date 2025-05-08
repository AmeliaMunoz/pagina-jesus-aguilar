import AdminSidebar from "../components/AdminSidebar";
import AppointmentCalendar from "../components/AppointmentCalendar";

const AppointmentsPage = () => {
  return (
    <div className="flex bg-[#fdf8f4] min-h-screen">
      <AdminSidebar />

      <main className="flex-1 ml-64 px-4 py-12">
        <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6">Calendario de citas</h2>
        <AppointmentCalendar />
      </main>
    </div>
  );
};

export default AppointmentsPage;


