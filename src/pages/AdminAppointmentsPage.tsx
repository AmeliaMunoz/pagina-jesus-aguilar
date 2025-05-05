import AdminHeader from "../components/AdminHeader";
import AppointmentCalendar from "../components/AppointmentCalendar";

const AppointmentsPage = () => {
  return (
    <div className="bg-[#fdf8f4] min-h-screen">
      <AdminHeader onLogout={() => {
        sessionStorage.removeItem("admin-autenticado");
        window.location.reload();
      }} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6">Calendario de citas</h2>
        <AppointmentCalendar />
      </main>
    </div>
  );
};

export default AppointmentsPage;

