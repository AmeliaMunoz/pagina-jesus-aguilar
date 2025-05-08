import AppointmentStats from "../components/AppointmentStats";
import AdminSidebar from "../components/AdminSidebar";

const AppointmentStatsPage = () => {
  return (
    <div className="flex bg-[#fdf8f4] min-h-screen">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-6">
        <AppointmentStats />
      </main>
    </div>
  );
};

export default AppointmentStatsPage;



