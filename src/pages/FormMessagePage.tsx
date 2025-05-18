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
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import desbloquearHora from "../components/UnblockHour";
import { CalendarDays, Phone, Mail } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import emailjs from "@emailjs/browser";
import { checkAppointmentExists } from "../utils/checkAppointmentExists";

const sendConfirmationEmail = async ({
  nombre,
  email,
  fecha,
  hora,
}: {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
}) => {
  try {
    await emailjs.send(
      "service_0u8915d",
      "template_plgpe5m",
      { nombre, email, fecha, hora },
      "7tsLKu2YpfAADoYYx"
    );
    console.log("📧 Email de confirmación enviado");
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
  }
};

const FormMessagesPage = () => {
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const location = useLocation();
  const [errorMensaje, setErrorMensaje] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [busqueda, setBusqueda] = useState("");


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
    setErrorMensaje("");
    const email = msgData?.email?.trim().toLowerCase();
    const nombre = msgData?.nombre || "";
    const telefono = msgData?.telefono || "";
    const nota = msgData?.mensaje || "";
    const fechaStr = fecha;
    const horaStr = hora;


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
      await updateDoc(doc(db, "mensajes", id), {
        estado: nuevoEstado,
        actualizado: Timestamp.now(),
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

    if (nuevoEstado === "aprobada" && msgData && fechaStr && horaStr && email) {
      const yaExiste = await checkAppointmentExists(email, fechaStr, horaStr);
    
      if (yaExiste) {
        setErrorMensaje("❗ Ya existe una cita registrada para ese paciente en esa fecha y hora.");
        return;
      }
    
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
    
      await sendConfirmationEmail({
        nombre,
        email,
        fecha: fechaStr,
        hora: horaStr,
      });
    
      // ✅ ACTUALIZAR EL MENSAJE A "aprobada"
      await updateDoc(doc(db, "mensajes", id), {
        estado: "aprobada",
        actualizado: Timestamp.now(),
      });
    
      const pacienteRef = doc(db, "pacientes", email);
      const pacienteSnap = await getDoc(pacienteRef);
      const entradaHistorial = {
        fecha: fechaStr,
        hora: horaStr,
        estado: "aprobada",
        nota,
      };
    
      if (!pacienteSnap.exists()) {
        await setDoc(pacienteRef, {
          nombre,
          email,
          telefono,
          historial: [entradaHistorial],
        });
      } else {
        const data = pacienteSnap.data();
        const historial = Array.isArray(data.historial) ? data.historial : [];
        historial.push(entradaHistorial);
        await updateDoc(pacienteRef, { historial });
      }
    }
    

    await obtenerMensajes();
  };

  const mensajesFiltrados = (filtroEstado === "todos" ? mensajes : mensajes.filter((m) => m.estado === filtroEstado))
  .filter((m) =>
    m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.email?.toLowerCase().includes(busqueda.toLowerCase())
  )
  .sort((a, b) => a.nombre.localeCompare(b.nombre));


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
  
          <div className="mb-8 text-center">
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
  
          {errorMensaje && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-6 text-sm text-center">
              {errorMensaje}
            </div>
          )}
  
          {mensajeExito && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-6 text-sm text-center">
              {mensajeExito}
            </div>
          )}
  
          {cargando ? (
            <p className="text-center text-[#5f4b32]">Cargando mensajes...</p>
          ) : mensajesFiltrados.length === 0 ? (
            <p className="text-center text-[#5f4b32]">No hay mensajes en esta categoría.</p>
          ) : (
            Object.entries(
              mensajesFiltrados
                .filter((m) =>
                  m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                  m.email?.toLowerCase().includes(busqueda.toLowerCase())
                )
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .reduce<Record<string, any[]>>((acc, msg) => {
                  const letra = msg.nombre.charAt(0).toUpperCase();
                  if (!acc[letra]) acc[letra] = [];
                  acc[letra].push(msg);
                  return acc;
                }, {})
            ).map(([letra, grupo]) => (
              <div key={letra} className="mb-6">
                <h3 className="text-lg font-bold text-[#5f4b32] mb-2">{letra}</h3>
                <div className="grid gap-6">
                  {grupo.map((m) => (
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
                          Fecha propuesta: {m.fechaPropuesta.toDate().toLocaleDateString("es-ES")} {m.horaPropuesta && `a las ${m.horaPropuesta}`}
                        </p>
                      )}
  
                      {m.mensaje && <p className="mt-2 text-gray-800">{m.mensaje}</p>}
  
                      <p className="mt-2 font-medium text-sm">
                        Estado: <span className={
                          m.estado === "pendiente"
                            ? "text-yellow-600"
                            : m.estado === "aprobada"
                            ? "text-green-700"
                            : "text-red-600"
                        }>
                          {m.estado}
                        </span>
                      </p>
  
                      <div className="mt-4 flex flex-wrap gap-4">
                        {filtroEstado !== "todos" && (
                          <>
                            <button
                              onClick={() => cambiarEstado(
                                m.id,
                                "aprobada",
                                m.fechaPropuesta?.toDate()?.toISOString().split("T")[0],
                                m.horaPropuesta,
                                m
                              )}
                              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => cambiarEstado(
                                m.id,
                                "rechazada",
                                m.fechaPropuesta?.toDate()?.toISOString().split("T")[0],
                                m.horaPropuesta,
                                m
                              )}
                              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={async () => {
                            await deleteDoc(doc(db, "mensajes", m.id));
                            setMensajeExito("🗑️ Mensaje eliminado correctamente"); 
                            await obtenerMensajes();
                          }}
                          className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}  
export default FormMessagesPage;
