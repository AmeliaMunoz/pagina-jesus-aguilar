import AppointmentStats from "../components/AppointmentStats";
import AdminLayout from "../layouts/AdminLayout";

const AppointmentStatsPage = () => {
  return (
    <AdminLayout>
      <main className="w-full max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-4 md:p-10">
          <AppointmentStats />
        </div>
      </main>
    </AdminLayout>
  );
};

export default AppointmentStatsPage;








