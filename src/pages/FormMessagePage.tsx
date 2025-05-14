import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  addDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import desbloquearHora from "../components/UnblockHour";
import { CalendarDays, Phone, Mail } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";

const FormMessagesPage = () => {
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const location = useLocation();

  useEffect(() => {
    obtenerMensajes();
  }, [location.pathname]);

  const obtenerMensajes = async () => {
    setCargando(true);
    const querySnapshot = await getDocs(collection(db, "mensajes"));
    const datos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMensajes(datos);
    setCargando(false);
  };

  const cambiarEstado = async (
    id: string,
    nuevoEstado: string,
    fecha?: string,
    hora?: string,
    msgData?: any
  ) => {
    const email = msgData?.email?.trim().toLowerCase();
    const nombre = msgData?.nombre || "";
    const telefono = msgData?.telefono || "";
    const nota = msgData?.mensaje || "";
    const fechaStr = fecha;
    const horaStr = hora;

    await updateDoc(doc(db, "mensajes", id), {
      estado: nuevoEstado,
      actualizado: Timestamp.now(),
    });

    if (nuevoEstado === "rechazada" && fechaStr && horaStr && email) {
      // Buscar cita existente y marcarla como rechazada
      const citasSnap = await getDocs(collection(db, "citas"));
      const citaDoc = citasSnap.docs.find((doc) => {
        const data = doc.data();
        return (
          data.email?.trim().toLowerCase() === email &&
          data.fecha === fechaStr &&
          data.hora === horaStr
        );
      });

      if (citaDoc) {
        await updateDoc(doc(db, "citas", citaDoc.id), {
          estado: "rechazada",
        });
        console.log("🗑️ Cita marcada como rechazada");
      } else {
        console.warn("⚠️ No se encontró cita para rechazar");
      }

      await desbloquearHora(fechaStr, horaStr);
      console.log("✅ Hora liberada:", fechaStr, horaStr);
    }

    if (nuevoEstado === "aprobada" && msgData) {
      const cita = {
        uid: msgData.uid || "",
        email,
        nombre,
        telefono,
        mensajeDelPaciente: nota,
        fecha: fechaStr,
        hora: horaStr,
        estado: "aprobada",
        anuladaPorUsuario: false,
        descontadaDelBono: false,
        creadoEl: new Date().toISOString(),
      };

      await addDoc(collection(db, "citas"), cita);
      console.log("✅ Cita guardada en 'citas'");

      const pacienteRef = doc(db, "pacientes", email);
      const pacienteSnap = await getDoc(pacienteRef);
      const entradaHistorial = {
        fecha: fechaStr,
        hora: horaStr,
        estado: "aprobada",
        nota,
      };

      if (!pacienteSnap.exists()) {
        console.log("➕ Creando nuevo paciente:", email);
        await setDoc(pacienteRef, {
          nombre,
          email,
          telefono,
          historial: [entradaHistorial],
        });
      } else {
        console.log("📌 Añadiendo al historial de:", email);
        const data = pacienteSnap.data();
        const historial = Array.isArray(data.historial) ? data.historial : [];
        historial.push(entradaHistorial);
        await updateDoc(pacienteRef, { historial });
      }
    }

    await obtenerMensajes();
  };

  const mensajesFiltrados =
    filtroEstado === "todos" ? mensajes : mensajes.filter((m) => m.estado === filtroEstado);

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto mt-10 px-4">
        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-8 text-center md:text-left">
            Gestión de mensajes
          </h2>

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
                {estado === "todos"
                  ? "Todos"
                  : estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>

          {cargando ? (
            <p className="text-center text-[#5f4b32]">Cargando mensajes...</p>
          ) : mensajesFiltrados.length === 0 ? (
            <p className="text-center text-[#5f4b32]">No hay mensajes en esta categoría.</p>
          ) : (
            <div className="grid gap-6">
              {mensajesFiltrados.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#fdf8f4] border border-[#e8d4c3] rounded-xl shadow-sm p-6"
                >
                  <p className="text-sm text-gray-500 mb-1">
                    {m.creado?.toDate().toLocaleString()}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800">{m.nombre}</h3>

                  <p className="text-sm text-gray-700 flex items-center gap-2 mt-2">
                    <Mail size={16} /> {m.email}
                  </p>

                  {m.telefono && (
                    <p className="text-sm text-gray-700 flex items-center gap-2 mt-2">
                      <Phone size={16} /> {m.telefono}
                    </p>
                  )}

                  {m.fechaPropuesta && (
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <CalendarDays size={16} />
                      Fecha propuesta:{" "}
                      {m.fechaPropuesta.toDate().toLocaleDateString("es-ES")}{" "}
                      {m.horaPropuesta ? `a las ${m.horaPropuesta}` : ""}
                    </p>
                  )}

                  {m.mensaje && <p className="mt-2 text-gray-800">{m.mensaje}</p>}

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
                    <div className="mt-4 flex flex-wrap gap-4">
                      <button
                        onClick={() =>
                          cambiarEstado(
                            m.id,
                            "aprobada",
                            m.fechaPropuesta?.toDate()?.toISOString().split("T")[0],
                            m.horaPropuesta,
                            m
                          )
                        }
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
                            m.horaPropuesta,
                            m
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default FormMessagesPage;
