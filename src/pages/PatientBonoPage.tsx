import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChartHorizontal,
  CheckCircle,
  Info,
  Ticket,
  Plus,
  Mail,
  CalendarClock,
  UserCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <CalendarClock /> },
  { label: "Mi bono", path: "/panel/paciente/bono", icon: <Ticket /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <BarChartHorizontal /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

const PatientBonoPage = () => {
  const [bono, setBono] = useState<{ total: number; usadas: number; pendientes: number } | null>(null);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const docRef = doc(db, "usuarios", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre || "");
        setBono(data.bono);
      }
    };

    fetchUser();
  }, []);

  if (!bono) {
    return <p className="p-6 text-gray-600">Cargando información del bono...</p>;
  }

  const porcentaje = (bono.usadas / bono.total) * 100;

  return (
    <div className="flex bg-[#f5ede3] min-h-screen">
      <Sidebar title="" items={pacienteNav} onLogout={() => auth.signOut()} />

      <main className="flex-1 bg-[#fdf8f4] px-6 sm:px-8 md:px-12 py-12 flex flex-col items-center justify-center">
        {/* Título fuera de las tarjetas */}
        <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 w-full max-w-3xl text-center md:text-left">
          {nombre}
        </h1>

        {/* Tarjeta exterior (blanca) */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-10">
          {/* Tarjeta interior (también blanca) */}
          <div className="bg-white border border-[#e0d6ca] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#5f4b32]">Mi bono de sesiones</h2>
                <p className="text-sm text-gray-600">Aquí puedes ver el estado de tu bono activo.</p>
              </div>
              <UserCheck className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
            </div>

            <div className="mb-6">
              <h3 className="text-md font-medium text-[#5f4b32] mb-2 flex items-center gap-2">
                <Ticket className="w-5 h-5" /> Progreso del bono
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner overflow-hidden">
                <div
                  className={`h-5 transition-all duration-300 ${
                    porcentaje >= 70 ? "bg-green-500" : porcentaje >= 30 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-right">
                {bono.usadas} usadas de {bono.total} sesiones
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f6f1] border border-[#e0d6ca] shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-[#5f4b32]">{bono.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f6f1] border border-[#e0d6ca] shadow-sm">
                <BarChartHorizontal className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Usadas</p>
                  <p className="font-semibold text-[#5f4b32]">{bono.usadas}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f6f1] border border-[#e0d6ca] shadow-sm">
                <Info className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Pendientes</p>
                  <p className="font-semibold text-[#5f4b32]">{bono.pendientes}</p>
                </div>
              </div>
            </div>

            {bono.pendientes === 0 && (
              <div className="mt-6 text-red-600 font-medium flex items-center gap-2 bg-red-100 border border-red-300 p-3 rounded-md">
                <AlertTriangle className="w-5 h-5" />
                Ya no te quedan sesiones disponibles. Contacta con tu psicólogo para renovar tu bono.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientBonoPage;






