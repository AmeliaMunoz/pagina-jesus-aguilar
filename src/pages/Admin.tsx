import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { CalendarDays,AlertCircle, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import PatientMessagesList from "../components/admin/PatientMessagesList";
import FormMessagesList from "../components/admin/FormMessagesList";
import TodayAppointmentsList from "../components/admin/TodayAppointmentsList";
import SummaryCard from "../components/admin/SummaryCard";

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
      <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-16 3xl:p-24 mt-10">
        <h1 className="text-2xl md:text-3xl 3xl:text-4xl font-bold text-[#5f4b32] mb-10 text-center">
          Panel de control — Resumen del día
        </h1>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 3xl:gap-12 mb-10">
          <SummaryCard
            icon={<CalendarDays className="w-10 h-10 3xl:w-12 3xl:h-12 text-green-700" />}
            title="Citas hoy"
            count={citasHoy.length}
            color="text-green-700"
          />
          <SummaryCard
            icon={<AlertCircle className="w-10 h-10 3xl:w-12 3xl:h-12 text-yellow-700" />}
            title="Mensajes formulario"
            count={mensajesFormulario.length}
            color="text-yellow-700"
          />
          <SummaryCard
            icon={<Mail className="w-10 h-10 3xl:w-12 3xl:h-12 text-blue-700" />}
            title="Mensajes pacientes"
            count={mensajesPacientes.length}
            color="text-blue-700"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 3xl:gap-6 mb-8 px-2">
          {["citas", "formulario", "pacientes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm 3xl:text-base font-medium transition ${
                activeTab === tab
                  ? "bg-[#b89b71] text-white"
                  : "bg-white border border-[#c8b29d] text-[#5f4b32]"
              }`}
            >
              {tab === "citas"
                ? "Citas de hoy"
                : tab === "formulario"
                ? "Mensajes formulario"
                : "Mensajes pacientes"}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="space-y-6 3xl:space-y-10">
          {activeTab === "citas" && (
            <section>
              <h2 className="text-xl md:text-2xl 3xl:text-3xl font-semibold text-[#5f4b32] mb-4 flex items-center gap-2">
                <CalendarDays size={20} className="md:size-6" /> Citas de hoy
              </h2>
              <TodayAppointmentsList citas={citasHoy} />
            </section>
          )}

          {activeTab === "formulario" && (
            <section>
              <h2 className="text-xl md:text-2xl 3xl:text-3xl font-semibold text-[#5f4b32] mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="md:size-6" /> Mensajes del formulario pendientes
              </h2>
              <FormMessagesList mensajes={mensajesFormulario} />
            </section>
          )}

          {activeTab === "pacientes" && (
            <section>
              <h2 className="text-xl md:text-2xl 3xl:text-3xl font-semibold text-[#5f4b32] mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="md:size-6" /> Mensajes de pacientes sin responder
              </h2>
              <PatientMessagesList mensajes={mensajesPacientes} />
            </section>
          )}
        </div>

        <div className="text-right mt-8">
          <button
            onClick={() => navigate("/admin/citas")}
            className="text-sm 3xl:text-base text-[#5f4b32] hover:underline"
          >
            Ver agenda completa →
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;

