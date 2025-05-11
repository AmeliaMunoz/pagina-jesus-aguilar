import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BookAppointmentFromUser from "../components/BookAppointmentFromUser";
import Sidebar from "../components/UserSidebar";
import HamburgerButton from "../components/HamburgerButton";
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
  const [userUid, setUserUid] = useState<string>("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

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
    <div className="flex min-h-screen bg-[#fdf8f4]">
      <HamburgerButton
        isOpen={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      <Sidebar
        title=""
        items={pacienteNav}
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={() => auth.signOut()}
      />

      <main className="w-full min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-5xl space-y-8">
          <h1 className="text-3xl font-bold text-[#5f4b32] text-center md:text-left">
            {userName}
          </h1>

          <div className="bg-white rounded-2xl shadow-2xl border border-[#e0d6ca] p-6 md:p-10">
            <BookAppointmentFromUser
              uid={userUid}
              userEmail={userEmail}
              userName={userName}
              bonoPendiente={bonoPendiente}
              onBooked={() => navigate("/panel/paciente/proxima-cita")}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookAppointmentPage;


