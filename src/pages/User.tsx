import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Sidebar from "../components/UserSidebar";
import HamburgerButton from "../components/HamburgerButton";
import {
  Calendar,
  Ticket,
  Clock,
  Plus,
  Mail,
} from "lucide-react";
import PatientCard from "../components/PatientCard";

interface Bono {
  total: number;
  usadas: number;
  pendientes: number;
}

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  anuladaPorUsuario: boolean;
}

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <Calendar /> },
  { label: "Mi bono", path: "/panel/paciente/bono", icon: <Ticket /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <Clock /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

const User = () => {
  const [nombre, setNombre] = useState<string>("");
  const [bono, setBono] = useState<Bono | null>(null);
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        navigate("/login");
        return;
      }

      const usuarioSnap = await getDoc(doc(db, "usuarios", uid));
      if (usuarioSnap.exists()) {
        const user = usuarioSnap.data();
        setNombre(user.nombre ?? "");
        setBono(user.bono ?? null);
      }

      const q = query(
        collection(db, "citas"),
        where("uid", "==", uid),
        where("estado", "==", "pendiente"),
        orderBy("fecha")
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setProximaCita({
          id: docSnap.id,
          fecha: data.fecha ?? "",
          hora: data.hora ?? "",
          estado: data.estado ?? "",
          anuladaPorUsuario: data.anuladaPorUsuario ?? false,
        });
      }
    };

    fetchData();
  }, [navigate]);

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
        onLogout={() => {
          auth.signOut();
          navigate("/login");
        }}
      />

      <main className="w-full min-h-screen px-4 py-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 w-full max-w-5xl ml-auto mr-auto text-center md:text-left">
          ¡Hola, {nombre}!
        </h1>

        <div className="w-full max-w-5xl ml-auto mr-auto">
          <div className="bg-white rounded-2xl shadow-3xl border border-[#e0d6ca] p-6 md:p-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {proximaCita && (
                <PatientCard title="Próxima cita">
                  {new Date(proximaCita.fecha).toLocaleDateString("es-ES")},{" "}
                  {proximaCita.hora}
                </PatientCard>
              )}

              {bono && (
                <PatientCard title="Mi bono">
                  Disponible: {bono.pendientes}{" "}
                  {bono.pendientes === 1 ? "sesión" : "sesiones"}
                </PatientCard>
              )}

              <PatientCard
                title="Historial de citas"
                onClick={() => navigate("/panel/paciente/historial")}
              >
                Ver historial completo
              </PatientCard>

              <PatientCard
                title="Mensajes privados"
                onClick={() => navigate("/panel/paciente/mensajes")}
              >
                Ver mensajes
              </PatientCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default User;

