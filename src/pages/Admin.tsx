import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import AdminHeader from "../components/AdminHeader";
import { CalendarDays, Clock, AlertCircle, Mail, CalendarClock } from "lucide-react";
import AdminCreateUser from "../components/AdminCreateUser";


interface Cita {
  id: string;
  nombre: string;
  email: string;
  fechaPropuesta: Date;
  horaPropuesta: string;
  estado: string;
}

const Admin = () => {
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);
  const [mensajesPendientes, setMensajesPendientes] = useState<Cita[]>([]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "mensajes"));
      const snapshot = await getDocs(q);
      const citas = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          email: data.email,
          fechaPropuesta: data.fechaPropuesta?.toDate(),
          horaPropuesta: data.horaPropuesta,
          estado: data.estado,
        } as Cita;
      });

      const hoyCitas = citas.filter(
        (c) =>
          c.fechaPropuesta &&
          c.fechaPropuesta >= hoy &&
          c.fechaPropuesta < mañana &&
          ["aprobada", "ausente"].includes(c.estado)
      );

      const futurasCitas = citas.filter(
        (c) =>
          c.fechaPropuesta &&
          c.fechaPropuesta > mañana &&
          ["aprobada", "ausente"].includes(c.estado)
      );

      const pendientes = citas.filter((c) => c.estado === "pendiente");

      setCitasHoy(hoyCitas);
      setProximasCitas(futurasCitas.slice(0, 5));
      setMensajesPendientes(pendientes.slice(0, 5));
    };

    fetchData();
  }, []);

  return (
    <div className="bg-[#fdf8f4] min-h-screen">
      <AdminHeader
        onLogout={() => {
          sessionStorage.removeItem("admin-autenticado");
          window.location.reload();
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      <AdminCreateUser />
      

        {/* Citas de hoy */}
        <section>
          <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6 flex items-center gap-2">
            <CalendarDays size={24} /> Citas de hoy
          </h2>
          {citasHoy.length === 0 ? (
            <p className="text-gray-600">No hay citas para hoy.</p>
          ) : (
            <ul className="space-y-3">
              {citasHoy.map((cita) => (
                <li
                  key={cita.id}
                  className={`p-4 rounded-lg shadow-sm border flex justify-between items-center ${
                    cita.estado === "ausente"
                      ? "bg-yellow-100 border-yellow-300"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
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

        {/* Mensajes pendientes */}
        <section>
          <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6 flex items-center gap-2">
            <AlertCircle size={24} /> Mensajes pendientes
          </h2>
          {mensajesPendientes.length === 0 ? (
            <p className="text-gray-600">No hay mensajes pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {mensajesPendientes.map((msg) => (
                <li
                  key={msg.id}
                  className="p-4 rounded-lg shadow-sm border bg-white border-[#f3d4a3] flex items-center gap-2 text-sm"
                >
                  <Mail size={16} className="text-[#5f4b32]" />
                  <span>
                    {msg.nombre} — {msg.email} —{" "}
                    {msg.fechaPropuesta?.toLocaleDateString("es-ES")}{" "}
                    {msg.horaPropuesta && `a las ${msg.horaPropuesta}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Próximas citas */}
        <section>
          <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6 flex items-center gap-2">
            <CalendarClock size={24} /> Próximas citas
          </h2>
          {proximasCitas.length === 0 ? (
            <p className="text-gray-600">No hay citas futuras.</p>
          ) : (
            <ul className="space-y-3">
              {proximasCitas.map((cita) => (
                <li
                  key={cita.id}
                  className="p-4 rounded-lg shadow-sm border bg-white border-gray-300 flex items-center gap-2 text-sm"
                >
                  <CalendarDays size={16} className="text-[#5f4b32]" />
                  <span>
                    {cita.fechaPropuesta?.toLocaleDateString("es-ES")} — {cita.horaPropuesta} — {cita.nombre}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Admin;






















