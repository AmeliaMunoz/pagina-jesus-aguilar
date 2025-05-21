import { JSX, useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { CalendarDays, Clock, AlertCircle, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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

const SummaryCard = ({ icon, title, count, color }: { icon: JSX.Element; title: string; count: number; color: string }) => (
  <div className="bg-[#fdf8f4] border border-[#e0d6ca] rounded-xl p-6 flex items-center gap-4 shadow-md">
    {icon}
    <div>
      <p className="text-sm text-[#5f4b32]">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{count}</p>
    </div>
  </div>
);

const Admin = () => {
  const [citasHoy, setCitasHoy] = useState<MensajeFormulario[]>([]);
  const [mensajesFormulario, setMensajesFormulario] = useState<MensajeFormulario[]>([]);
  const [mensajesPacientes, setMensajesPacientes] = useState<MensajePaciente[]>([]);
  const [activeTab, setActiveTab] = useState("citas");
  const location = useLocation();
  const navigate = useNavigate();

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

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(hoy.getDate() + 1);

      const pendientesFormulario = mensajes.filter((m) => m.estado === "pendiente");
      setMensajesFormulario(pendientesFormulario);

      const citasSnap = await getDocs(collection(db, "citas"));
      const citasHoy: MensajeFormulario[] = citasSnap.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre,
            email: data.email,
            fechaPropuesta: data.fecha ? new Date(data.fecha) : undefined,
            horaPropuesta: data.hora,
            estado: data.estado,
          };
        })
        .filter(
          (cita) =>
            cita.fechaPropuesta &&
            cita.fechaPropuesta >= hoy &&
            cita.fechaPropuesta < mañana &&
            ["aprobada", "ausente"].includes(cita.estado || "")
        );

      setCitasHoy(citasHoy);

      const mensajesSnap = await getDocs(query(collection(db, "mensajes"), orderBy("fecha", "asc")));
      const pacientes = new Map<string, MensajePaciente[]>();

      mensajesSnap.forEach((doc) => {
        const data = doc.data();
        if (!data.uid || !data.nombre || !data.email || !data.fecha) return;
        if (!pacientes.has(data.uid)) pacientes.set(data.uid, []);
        pacientes.get(data.uid)!.push({
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
      pacientes.forEach((mensajes) => {
        const ultimo = mensajes[mensajes.length - 1];
        if (ultimo.enviadoPorPaciente) pendientesPacientes.push(ultimo);
      });

      setMensajesPacientes(pendientesPacientes);
    };

    fetchData();
  }, [location.pathname]);

  return (
    <AdminLayout>
      <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-16 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#5f4b32] mb-10 text-center">
          Panel de control — Resumen del día
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <SummaryCard
            icon={<CalendarDays className="w-10 h-10 text-green-700" />}
            title="Citas hoy"
            count={citasHoy.length}
            color="text-green-700"
          />
          <SummaryCard
            icon={<AlertCircle className="w-10 h-10 text-yellow-700" />}
            title="Mensajes formulario"
            count={mensajesFormulario.length}
            color="text-yellow-700"
          />
          <SummaryCard
            icon={<Mail className="w-10 h-10 text-blue-700" />}
            title="Mensajes pacientes"
            count={mensajesPacientes.length}
            color="text-blue-700"
          />
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("citas")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "citas"
                ? "bg-[#b89b71] text-white"
                : "bg-white border border-[#c8b29d] text-[#5f4b32]"
            }`}
          >
            Citas de hoy
          </button>
          <button
            onClick={() => setActiveTab("formulario")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "formulario"
                ? "bg-[#b89b71] text-white"
                : "bg-white border border-[#c8b29d] text-[#5f4b32]"
            }`}
          >
            Mensajes formulario
          </button>
          <button
            onClick={() => setActiveTab("pacientes")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "pacientes"
                ? "bg-[#b89b71] text-white"
                : "bg-white border border-[#c8b29d] text-[#5f4b32]"
            }`}
          >
            Mensajes pacientes
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "citas" && (
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-4 flex items-center gap-2">
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
          )}

          {activeTab === "formulario" && (
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-4 flex items-center gap-2">
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
                          {msg.nombre} — {msg.email} — {msg.fechaPropuesta?.toLocaleDateString("es-ES")} {msg.horaPropuesta && `a las ${msg.horaPropuesta}`}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === "pacientes" && (
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-4 flex items-center gap-2">
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
          )}
        </div>

        <div className="text-right mt-8">
          <button
            onClick={() => navigate("/admin/citas")}
            className="text-sm text-[#5f4b32] hover:underline"
          >
            Ver agenda completa →
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
