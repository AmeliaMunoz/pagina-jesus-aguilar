import AppointmentCalendar from "../components/AppointmentCalendar";
import AdminLayout from "../layouts/AdminLayout";

const AppointmentsPage = () => {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6 text-center md:text-left">
      </h2>
      <AppointmentCalendar />
    </AdminLayout>
  );
};

export default AppointmentsPage;





