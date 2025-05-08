import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import BookAppointmentFromUser from "../components/BookAppointmentFromUser";
import Sidebar from "../components/Sidebar";
import { Calendar, Ticket, Clock, Plus, Mail } from "lucide-react";

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <Calendar /> },
  { label: "Mi bono", path: "/panel/paciente/bono", icon: <Ticket /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <Clock /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

const BookAppointmentPage = () => {
  const [bonoPendiente, setBonoPendiente] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUserEmail(currentUser.email || "");

      const docRef = doc(db, "usuarios", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.nombre || "");
        setBonoPendiente(data.bono?.pendientes ?? 0);
      }
    };

    fetchUser();
  }, []);

  if (bonoPendiente === null) {
    return <p className="p-6 text-gray-600">Cargando calendario...</p>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar title="" items={pacienteNav} />

      <main className="flex-1 bg-[#fdf8f4] px-6 sm:px-10 md:px-16 py-12 overflow-y-auto pl-64">
        {/* Saludo */}
        <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 w-full max-w-3xl mx-auto text-center md:text-left">
          Hola, {userName}
        </h1>

        {/* Tarjeta centrada */}
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-[#e0d6ca] p-10">
          <BookAppointmentFromUser
            uid={auth.currentUser?.uid || ""}
            userEmail={userEmail}
            userName={userName}
            bonoPendiente={bonoPendiente}
            onBooked={() => window.location.reload()}
          />
        </div>
      </main>
    </div>
  );
};

export default BookAppointmentPage;







