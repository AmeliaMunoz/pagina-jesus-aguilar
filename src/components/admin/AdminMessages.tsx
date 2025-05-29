import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  Timestamp,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import desbloquearHora from "../common/UnblockHour";
import { CalendarDays, Phone, Mail } from "lucide-react";

interface Props {
  onToast: (msg: string) => void;
}

const AdminMessages = ({ onToast }: Props) => {
  console.log("🧠 ADMINMESSAGES MONTADO");

  const [mensajes, setMensajes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [busqueda, setBusqueda] = useState("");

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
    console.log("🟡 clic detectado — entrando a cambiarEstado", id, nuevoEstado);

    const mensajeRef = doc(db, "mensajes", id);
    const mensajeSnap = await getDoc(mensajeRef);
    if (!mensajeSnap.exists()) {
      console.warn("❌ No se encontró el mensaje con ID:", id);
      return;
    }

    const mensaje = mensajeSnap.data();
    const email = mensaje.email?.trim().toLowerCase();
    const nombre = mensaje.nombre || "";
    const telefono = mensaje.telefono || "";
    const nota = mensaje.mensaje || "";
    const fechaStr = fecha || mensaje.fechaPropuesta?.toDate()?.toLocaleDateString("sv-SE");
    const horaStr = hora || mensaje.horaPropuesta;

    console.log("⏳ Aprobando mensaje...");
    console.log("email:", email);
    console.log("fecha:", fechaStr);
    console.log("hora:", horaStr);

    // 1. Actualizar mensaje
    await updateDoc(mensajeRef, {
      estado: nuevoEstado,
      actualizado: Timestamp.now(),
    });

    // 2. Si RECHAZADA → liberar hora
    if (nuevoEstado === "rechazada" && fechaStr && horaStr) {
      await desbloquearHora(fechaStr, horaStr);
      console.log("🧹 Hora liberada:", fechaStr, horaStr);
    }

    // 3. Si APROBADA → actualizar cita + historial
    if (nuevoEstado === "aprobada") {
      if (!email || !fechaStr || !horaStr) {
        console.warn("❌ Faltan datos para aprobar:", { email, fechaStr, horaStr });
        return;
      }

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
        const citaRef = doc(db, "citas", citaDoc.id);
        await updateDoc(citaRef, {
          estado: "aprobada",
          mensajeDelPaciente: nota,
          actualizado: Timestamp.now(),
        });
        console.log("✅ Cita pendiente actualizada a 'aprobada'");
      } else {
        // Si no existe una cita pendiente, crearla
        const nuevaCita = {
          uid: mensaje.uid || "",
          email,
          nombre,
          telefono,
          mensajeDelPaciente: nota,
          fecha: fechaStr,
          hora: horaStr,
          estado: "aprobada",
          creadoEl: new Date().toISOString(),
          anuladaPorUsuario: false,
          descontadaDelBono: false,
        };
        await addDoc(collection(db, "citas"), nuevaCita);
        console.log("✅ Nueva cita creada con estado 'aprobada'");
      }      

      const pacienteRef = doc(db, "pacientes", email);
      const pacienteSnap = await getDoc(pacienteRef);
      const nuevaEntrada = {
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
          historial: [nuevaEntrada],
        });
      } else {
        console.log("📌 Añadiendo entrada a historial:", email);
        const data = pacienteSnap.data();
        const historial = Array.isArray(data.historial) ? data.historial : [];
        historial.push(nuevaEntrada);
        await updateDoc(pacienteRef, { historial });
      }
    }

    await obtenerMensajes();
    onToast(`Mensaje marcado como "${nuevoEstado}"`);
  };

  const mensajesFiltrados =
  filtroEstado === "todos" ? mensajes : mensajes.filter((m) => m.estado === filtroEstado);

  return (
    <main className="min-h-screen w-full lg:ml-64 px-4 py-8 flex items-center justify-center">
      <section className="w-full max-w-5xl mb-16 scroll-mt-32" id="mensajes">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {['pendiente', 'rechazada', 'aprobada', 'todos'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filtroEstado === estado
                  ? 'bg-[#b89b71] text-white'
                  : 'bg-white border border-[#c8b29d] text-[#5f4b32]'
              }`}
            >
              {estado === 'todos' ? 'Todos' : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
  
        {/* Buscador */}
        <div className="mb-8 text-center">
          <input
            type="text"
            placeholder="Buscar por nombre o email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
  
        {/* Lista de mensajes */}
        {cargando ? (
          <p className="text-center text-brown-700">Cargando mensajes...</p>
        ) : mensajesFiltrados.length === 0 ? (
          <p className="text-center text-brown-700">No hay mensajes en esta categoría.</p>
        ) : (
          Object.entries(
            mensajesFiltrados
              .filter((m) =>
                m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                m.email?.toLowerCase().includes(busqueda.toLowerCase())
              )
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
              .reduce((acc: Record<string, any[]>, msg) => {
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
                  <div key={m.id} className="bg-white border border-[#e8d4c3] rounded-xl shadow-sm p-6">
                    <p className="text-sm text-gray-500 mb-1">
                      {m.creado?.toDate().toLocaleString()}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-800">{m.nombre}</h3>
  
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Mail size={16} /> {m.email}
                    </p>
  
                    {m.telefono && (
                      <p className="text-sm text-gray-700 flex items-center gap-2">
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
                        m.estado === 'pendiente'
                          ? 'text-yellow-600'
                          : m.estado === 'aprobada'
                          ? 'text-green-700'
                          : 'text-red-600'
                      }>
                        {m.estado}
                      </span>
                    </p>
  
                    {filtroEstado !== 'todos' && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        <button
                          onClick={() => cambiarEstado(m.id, 'aprobada')}
                          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() =>
                            cambiarEstado(
                              m.id,
                              'rechazada',
                              m.fechaPropuesta?.toDate()?.toLocaleDateString('sv-SE'),
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
            </div>
          ))
        )}
      </section>
    </main>
  );
}  

export default AdminMessages;




