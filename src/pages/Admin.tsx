import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { CalendarDays, Clock, AlertCircle, Mail } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import HamburgerButton from "../components/HamburgerButton";
import { useLocation } from "react-router-dom";

interface MensajeFormulario {
  id: string;
  nombre: string;
  email: string;
  fechaPropuesta?: Date;
  horaPropuesta?: string;
  estado?: string;
}

interface MensajePaciente {
  id: string;
  uid: string;
  nombre: string;
  email: string;
  texto: string;
  fecha: Date;
  enviadoPorPaciente: boolean;
}

const Admin = () => {
  const [citasHoy, setCitasHoy] = useState<MensajeFormulario[]>([]);
  const [mensajesFormulario, setMensajesFormulario] = useState<MensajeFormulario[]>([]);
  const [mensajesPacientes, setMensajesPacientes] = useState<MensajePaciente[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      const formSnapshot = await getDocs(query(collection(db, "mensajes")));
      const mensajes: MensajeFormulario[] = formSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          email: data.email,
          fechaPropuesta: data.fechaPropuesta?.toDate(),
          horaPropuesta: data.horaPropuesta,
          estado: data.estado,
        };
      });

      const pendientesFormulario = mensajes.filter((m) => m.estado === "pendiente");
      const hoyCitas = mensajes.filter(
        (m) =>
          m.fechaPropuesta &&
          m.fechaPropuesta >= hoy &&
          m.fechaPropuesta < mañana &&
          ["aprobada", "ausente"].includes(m.estado || "")
      );

      setMensajesFormulario(pendientesFormulario);
      setCitasHoy(hoyCitas);

      const mensajesSnap = await getDocs(query(collection(db, "mensajes"), orderBy("fecha", "asc")));
      const pacientes = new Map();

      mensajesSnap.forEach((doc) => {
        const data = doc.data();
        if (!data.uid || !data.nombre || !data.email || !data.fecha) return;
        if (!pacientes.has(data.uid)) pacientes.set(data.uid, []);
        pacientes.get(data.uid).push({
          id: doc.id,
          uid: data.uid,
          nombre: data.nombre,
          email: data.email,
          texto: data.texto,
          fecha: data.fecha.toDate(),
          enviadoPorPaciente: data.enviadoPorPaciente,
        });
      });

      const pendientesPacientes: MensajePaciente[] = [];

      pacientes.forEach((mensajes: MensajePaciente[]) => {
        const ultimo = mensajes[mensajes.length - 1];
        if (ultimo.enviadoPorPaciente) pendientesPacientes.push(ultimo);
      });

      setMensajesPacientes(pendientesPacientes);
    };

    fetchData();
  }, [location.pathname]);

  return (
    <div className="flex bg-[#fdf8f4] min-h-screen overflow-x-hidden relative">
      <HamburgerButton isOpen={sidebarVisible} onToggle={() => setSidebarVisible(!sidebarVisible)} />

      <AdminSidebar isOpen={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <main className="w-full min-h-screen px-4 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl space-y-16">
          {/* Citas de hoy */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-4 md:mb-6 flex items-center gap-2">
              <CalendarDays size={20} className="md:size-6" /> Citas de hoy
            </h2>
            {citasHoy.length === 0 ? (
              <p className="text-gray-600 text-sm md:text-base">No hay citas para hoy.</p>
            ) : (
              <ul className="space-y-3">
                {citasHoy.map((cita) => (
                  <li
                    key={cita.id}
                    className={`p-3 md:p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                      cita.estado === "ausente"
                        ? "bg-yellow-100 border-yellow-300"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <Clock size={16} className="text-[#5f4b32]" />
                      <span>
                        {cita.horaPropuesta} — {cita.nombre} ({cita.email})
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        cita.estado === "ausente"
                          ? "text-yellow-800"
                          : "text-green-700"
                      }`}
                    >
                      {cita.estado === "ausente" ? "Ausente" : "Confirmada"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Mensajes formulario */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-4 md:mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="md:size-6" /> Mensajes del formulario pendientes
            </h2>
            {mensajesFormulario.length === 0 ? (
              <p className="text-gray-600 text-sm md:text-base">No hay mensajes pendientes del formulario.</p>
            ) : (
              <ul className="space-y-3">
                {mensajesFormulario.map((msg) => (
                  <li
                    key={msg.id}
                    className="p-3 md:p-4 rounded-lg shadow-sm border bg-white border-[#f3d4a3] flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm md:text-base"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#5f4b32]" />
                      <span>
                        {msg.nombre} — {msg.email} —{" "}
                        {msg.fechaPropuesta?.toLocaleDateString("es-ES")}{" "}
                        {msg.horaPropuesta && `a las ${msg.horaPropuesta}`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Mensajes pacientes */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-4 md:mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="md:size-6" /> Mensajes de pacientes sin responder
            </h2>
            {mensajesPacientes.length === 0 ? (
              <p className="text-gray-600 text-sm md:text-base">No hay mensajes pendientes de pacientes.</p>
            ) : (
              <ul className="space-y-3">
                {mensajesPacientes.map((msg) => (
                  <li
                    key={msg.id}
                    className="p-3 md:p-4 rounded-lg shadow-sm border bg-white border-[#f3d4a3] flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm md:text-base"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#5f4b32]" />
                      <span>
                        {msg.nombre} — {msg.email} — {msg.fecha.toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;

