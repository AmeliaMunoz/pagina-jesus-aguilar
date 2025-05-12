import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { CalendarDays, Clock, AlertCircle, Mail } from "lucide-react";
import { useLocation } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

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
  const location = useLocation();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);

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
    <AdminLayout>
      <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10 w-full">
        <div className="space-y-16">
          {/* Citas de hoy */}
          <section className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] flex items-center gap-2 text-center md:text-left">
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
                        : "bg-[#fdf8f4] border-[#e0d6ca]"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm md:text-base text-[#5f4b32]">
                      <Clock size={16} />
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
          <section className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] flex items-center gap-2 text-center md:text-left">
              <AlertCircle size={20} className="md:size-6" /> Mensajes del formulario pendientes
            </h2>
            {mensajesFormulario.length === 0 ? (
              <p className="text-gray-600 text-sm md:text-base">No hay mensajes pendientes del formulario.</p>
            ) : (
              <ul className="space-y-3">
                {mensajesFormulario.map((msg) => (
                  <li
                    key={msg.id}
                    className="p-3 md:p-4 rounded-lg shadow-sm border bg-[#fdf8f4] border-[#f3d4a3] flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm md:text-base text-[#5f4b32]"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
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
          <section className="space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] flex items-center gap-2 text-center md:text-left">
              <AlertCircle size={20} className="md:size-6" /> Mensajes de pacientes sin responder
            </h2>
            {mensajesPacientes.length === 0 ? (
              <p className="text-gray-600 text-sm md:text-base">No hay mensajes pendientes de pacientes.</p>
            ) : (
              <ul className="space-y-3">
                {mensajesPacientes.map((msg) => (
                  <li
                    key={msg.id}
                    className="p-3 md:p-4 rounded-lg shadow-sm border bg-[#fdf8f4] border-[#f3d4a3] flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm md:text-base text-[#5f4b32]"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
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
      </div>
    </AdminLayout>
  );
};

export default Admin;



