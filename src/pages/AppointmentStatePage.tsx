import AppointmentStats from "../components/AppointmentStats";
import AdminLayout from "../layouts/AdminLayout";

const AppointmentStatsPage = () => {
  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
        <AppointmentStats />
      </div>
    </AdminLayout>
  );
};

export default AppointmentStatsPage;






