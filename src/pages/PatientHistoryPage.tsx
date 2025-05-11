import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Ban,
  HelpCircle,
  CalendarClock,
  Ticket,
  BarChartHorizontal,
  Plus,
  Mail,
  ClipboardList,
} from "lucide-react";
import Sidebar from "../components/UserSidebar";
import HamburgerButton from "../components/HamburgerButton";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <CalendarClock /> },
  { label: "Mi bono", path: "/panel/paciente/bono", icon: <Ticket /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <BarChartHorizontal /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
}

const PatientHistoryPage = () => {
  const [historial, setHistorial] = useState<Cita[]>([]);
  const [nombre, setNombre] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchHistorial = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDocs(
        query(collection(db, "usuarios"), where("uid", "==", user.uid))
      );
      const docData = userDoc.docs[0]?.data();
      setNombre(docData?.nombre || "");

      const q = query(
        collection(db, "citas"),
        where("uid", "==", user.uid),
        where("estado", "in", ["realizada", "anulada", "ausente"]),
        orderBy("fecha", "desc")
      );

      const snapshot = await getDocs(q);
      const citas = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fecha: data.fecha ?? "",
          hora: data.hora ?? "",
          estado: data.estado ?? "",
        };
      });

      setHistorial(citas);
    };

    fetchHistorial();
  }, []);

  const estadoColor = {
    realizada: "text-green-600",
    anulada: "text-red-500",
    ausente: "text-yellow-500",
  };

  const estadoIcon = {
    realizada: <CalendarCheck className="w-4 h-4" />,
    anulada: <Ban className="w-4 h-4" />,
    ausente: <HelpCircle className="w-4 h-4" />,
  };

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
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 text-center md:text-left">
            {nombre}
          </h1>

          <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
            <div className="bg-white border border-[#e0d6ca] rounded-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#5f4b32]">Historial de citas</h2>
                <ClipboardList className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
              </div>

              {historial.length === 0 ? (
                <p className="text-gray-600">No hay citas pasadas registradas.</p>
              ) : (
                <ul className="divide-y divide-gray-200 text-sm text-[#5f4b32]">
                  {historial.map((cita) => (
                    <li key={cita.id} className="py-3 flex justify-between items-center">
                      <span>
                        {new Date(cita.fecha).toLocaleDateString("es-ES")} — {cita.hora}
                      </span>
                      <span
                        className={`flex items-center gap-2 font-medium capitalize ${
                          estadoColor[cita.estado as keyof typeof estadoColor]
                        }`}
                      >
                        {estadoIcon[cita.estado as keyof typeof estadoIcon]} {cita.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientHistoryPage;
