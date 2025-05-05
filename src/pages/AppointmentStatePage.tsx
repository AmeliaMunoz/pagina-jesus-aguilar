import AppointmentStats from "../components/AppointmentStats";
import AdminHeader from "../components/AdminHeader";

const AppointmentStatsPage = () => {
  const handleLogout = () => {
    sessionStorage.removeItem("admin-autenticado");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      <AdminHeader onLogout={handleLogout} />
      <AppointmentStats />
    </div>
  );
};

export default AppointmentStatsPage;


