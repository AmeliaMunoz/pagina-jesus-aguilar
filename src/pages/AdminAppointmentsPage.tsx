import AppointmentCalendar from "../components/AppointmentCalendar";
import AdminLayout from "../layouts/AdminLayout";

const AdminAppointmentsPage = () => {
  return (
    <AdminLayout>
      <main className="min-h-screen w-full flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
            <AppointmentCalendar />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;








