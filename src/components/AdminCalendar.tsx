import AppointmentCalendar from "./AppointmentCalendar";

const AdminCalendar = () => {
  return (
    <section className="mb-16 scroll-mt-32 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
          <AppointmentCalendar />
        </div>
      </div>
    </section>
  );
};

export default AdminCalendar;

