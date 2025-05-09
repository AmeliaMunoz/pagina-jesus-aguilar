import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BookAppointmentFromUser from "../components/BookAppointmentFromUser";
import Sidebar from "../components/Sidebar";
import { Calendar, Ticket, Clock, Plus, Mail, CheckCircle } from "lucide-react";

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
  const [userUid, setUserUid] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUserUid(currentUser.uid);
      setUserEmail(currentUser.email || "");

      const docRef = doc(db, "usuarios", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.nombre || "");
        setBonoPendiente(data.bono?.pendientes ?? 0);
      } else {
        setBonoPendiente(0);
      }
    });

    return () => unsubscribe();
  }, []);

  if (bonoPendiente === null) {
    return <p className="p-6 text-gray-600">Cargando calendario...</p>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar title="" items={pacienteNav} />

      <main className="flex-1 bg-[#fdf8f4] px-6 py-12 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl ml-auto mr-auto lg:mr-24">
          <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 text-center md:text-left">
            {userName}
          </h1>

          {successMessage && (
            <div className="bg-[#f5ede6] text-[#5f4b32] border border-[#c8b29d] px-4 py-3 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Tu cita ha sido reservada correctamente.
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl border border-[#e0d6ca] p-10">
            <BookAppointmentFromUser
              uid={userUid}
              userEmail={userEmail}
              userName={userName}
              bonoPendiente={bonoPendiente}
              onBooked={() => setSuccessMessage(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointmentPage;












