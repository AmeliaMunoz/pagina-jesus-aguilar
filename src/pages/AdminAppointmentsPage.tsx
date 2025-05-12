import AppointmentCalendar from "../components/AppointmentCalendar";
import AdminLayout from "../layouts/AdminLayout";

const AdminAppointmentsPage = () => {
  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto mt-10 px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-6 text-center md:text-left">
        
        </h2>

        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-4 md:p-6">
          <AppointmentCalendar />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;






