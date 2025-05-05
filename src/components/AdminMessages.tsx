import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import desbloquearHora from "./UnblockHour";
import { CalendarDays, Phone, Mail } from "lucide-react";

interface Props {
  onToast: (msg: string) => void;
}

const AdminMessages = ({ onToast }: Props) => {
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  const obtenerMensajes = async () => {
    setCargando(true);
    const querySnapshot = await getDocs(collection(db, "mensajes"));
    const datos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMensajes(datos);
    setCargando(false);
  };

  useEffect(() => {
    obtenerMensajes();
  }, []);

  const cambiarEstado = async (id: string, nuevoEstado: string, fecha?: string, hora?: string) => {
    await updateDoc(doc(db, "mensajes", id), {
      estado: nuevoEstado,
      actualizado: Timestamp.now(),
    });
    if (nuevoEstado === "rechazada" && fecha && hora) {
      await desbloquearHora(fecha, hora);
    }
    await obtenerMensajes();
    onToast(`Mensaje marcado como "${nuevoEstado}"`);
  };

  const mensajesFiltrados =
    filtroEstado === "todos" ? mensajes : mensajes.filter((m) => m.estado === filtroEstado);

  return (
    <section className="mb-16 scroll-mt-32" id="mensajes">
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {["pendiente", "rechazada", "aprobada", "todos"].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filtroEstado === estado
                ? "bg-[#b89b71] text-white"
                : "bg-white border border-[#c8b29d] text-[#5f4b32]"
            }`}
          >
            {estado === "todos" ? "Todos" : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="text-center text-brown-700">Cargando mensajes...</p>
      ) : mensajesFiltrados.length === 0 ? (
        <p className="text-center text-brown-700">No hay mensajes en esta categoría.</p>
      ) : (
        <div className="grid gap-6">
          {mensajesFiltrados.map((m) => (
            <div key={m.id} className="bg-white border border-[#e8d4c3] rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">{m.creado?.toDate().toLocaleString()}</p>
              <h3 className="text-lg font-semibold text-gray-800">{m.nombre}</h3>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Mail size={16} />
                {m.email}
              </p>
              {m.telefono && (
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Phone />
                  {m.telefono}
                </p>
              )}
              <p className="mt-2 text-gray-800">{m.mensaje}</p>
              {m.fechaPropuesta && (
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <CalendarDays />
                  Fecha propuesta: {m.fechaPropuesta.toDate().toLocaleDateString("es-ES")}{" "}
                  {m.horaPropuesta ? `a las ${m.horaPropuesta}` : ""}
                </p>
              )}
              <p className="mt-2 font-medium text-sm">
                Estado:{" "}
                <span
                  className={
                    m.estado === "pendiente"
                      ? "text-yellow-600"
                      : m.estado === "aprobada"
                      ? "text-green-700"
                      : "text-red-600"
                  }
                >
                  {m.estado}
                </span>
              </p>
              {filtroEstado !== "todos" && (
                <div className="mt-4 flex gap-4 flex-wrap">
                  <button
                    onClick={() => cambiarEstado(m.id, "aprobada")}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() =>
                      cambiarEstado(
                        m.id,
                        "rechazada",
                        m.fechaPropuesta?.toDate()?.toISOString().split("T")[0],
                        m.horaPropuesta
                      )
                    }
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminMessages;

