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
import desbloquearHora from "../components/common/UnblockHour";
import AdminLayout from "../layouts/AdminLayout";
import emailjs from "@emailjs/browser";
import { checkAppointmentExists } from "../utils/checkAppointmentExists";
import ActiveAppointmentAlert from "../components/sections/ActiveAppointmentAlert";
import MessageListByLetter from "../components/sections/MessageListByLetter";
import MessageSearchInput from "../components/sections/MessageSearchInput";
import MessageFilterBar from "../components/sections/MessageFilterBar";

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
  const [busqueda, setBusqueda] = useState("");
  const [alertaCitaActiva, setAlertaCitaActiva] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
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
    setErrorMensaje("");
    const email = msgData?.email?.trim().toLowerCase();
    const nombre = msgData?.nombre || "";
    const telefono = msgData?.telefono || "";
    const nota = msgData?.mensaje || "";
    const fechaStr = fecha;
    const horaStr = hora;

    if (nuevoEstado === "rechazada" && fechaStr && horaStr && email) {
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
        const data = citaDoc.data();
        const fueForzada = data?.forzada === true;
    
        await updateDoc(doc(db, "citas", citaDoc.id), {
          estado: "rechazada",
        });
        console.log("🗑️ Cita marcada como rechazada");
    
        // ✅ Solo liberar si no fue forzada
        if (!fueForzada) {
          await desbloquearHora(fechaStr, horaStr);
        }
      }
    }
    

    if (nuevoEstado === "aprobada" && msgData && fechaStr && horaStr && email) {
      const yaExiste = await checkAppointmentExists(email);

      if (yaExiste) {
        setAlertaCitaActiva(true);
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
      await sendConfirmationEmail({ nombre, email, fecha: fechaStr, hora: horaStr });

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

  const eliminarMensaje = async (id: string) => {
    await deleteDoc(doc(db, "mensajes", id));
    setMensajeExito("🗑️ Mensaje eliminado correctamente");
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

          <MessageFilterBar filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado} />
          <MessageSearchInput busqueda={busqueda} setBusqueda={setBusqueda} />

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
            <MessageListByLetter
              mensajesFiltrados={mensajesFiltrados}
              filtroEstado={filtroEstado}
              cambiarEstado={cambiarEstado}
              eliminarMensaje={eliminarMensaje}
            />
          )}
        </div>
      </div>

      {alertaCitaActiva && (
        <ActiveAppointmentAlert onClose={() => setAlertaCitaActiva(false)} />
      )}
    </AdminLayout>
  );
};

export default FormMessagesPage;
