import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  getDoc,
  setDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import AppointmentCalendar from "../components/AppointmentCalendar";
import desbloquearHora from "../components/UnblockHour";
import AdminHeader from "../components/AdminHeader";
import IconoLogo from "../components/IconoLogo";
import { useNavigate } from "react-router-dom";

const PASSWORD = "admin123";

const Admin = () => {
  const [autenticado, setAutenticado] = useState(false);
  const [clave, setClave] = useState("");
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [mensajeToast, setMensajeToast] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const sesionGuardada = sessionStorage.getItem("admin-autenticado");
    if (sesionGuardada === "true") {
      setAutenticado(true);
    }
  }, []);

  const obtenerMensajes = async () => {
    setCargando(true);
    const querySnapshot = await getDocs(collection(db, "mensajes"));
    const datos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMensajes(datos);
    setCargando(false);
  };

  useEffect(() => {
    if (autenticado) {
      obtenerMensajes();
    }
  }, [autenticado]);

  const guardarCitaEnHistorial = async (email: string, nombre: string, telefono: string, cita: any) => {
    const ref = doc(db, "pacientes", email);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, {
        historial: arrayUnion(cita),
      });
    } else {
      await setDoc(ref, {
        nombre,
        email,
        telefono,
        creado: serverTimestamp(),
        historial: [cita],
      });
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const mensajeRef = doc(db, "mensajes", id);
    const mensajeSnap = await getDoc(mensajeRef);

    if (!mensajeSnap.exists()) return;

    const mensaje = mensajeSnap.data();

    await updateDoc(mensajeRef, {
      estado: nuevoEstado,
      actualizado: Timestamp.now(),
    });

    if (
      nuevoEstado === "aprobada" &&
      mensaje.email &&
      mensaje.nombre &&
      mensaje.fechaPropuesta &&
      mensaje.horaPropuesta
    ) {
      await guardarCitaEnHistorial(
        mensaje.email,
        mensaje.nombre,
        mensaje.telefono || "Desconocido",
        {
          fecha: mensaje.fechaPropuesta.toDate().toISOString().split("T")[0],
          hora: mensaje.horaPropuesta,
          estado: "aprobada",
          nota: mensaje.mensaje || "",
        }
      );
    }

    obtenerMensajes();
    setMensajeToast(`Mensaje marcado como "${nuevoEstado}"`);
    setTimeout(() => setMensajeToast(""), 4000);
  };

  const handleLogout = () => {
    setAutenticado(false);
    sessionStorage.removeItem("admin-autenticado");
    navigate("/admin");
  };

  const mensajesFiltrados =
    filtroEstado === "todos"
      ? mensajes
      : mensajes.filter((m) => m.estado === filtroEstado);

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4] px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <IconoLogo className="w-20 h-20" />
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Acceso Admin</h2>
          <input
            type="password"
            placeholder="Introduce la contraseña"
            className="border border-gray-300 rounded px-4 py-2 w-full text-sm mb-4"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          <button
            onClick={() => {
              if (clave === PASSWORD) {
                setAutenticado(true);
                sessionStorage.setItem("admin-autenticado", "true");
              } else {
                alert("Contraseña incorrecta");
              }
            }}
            className="bg-[#b89b71] hover:bg-[#9e855c] text-white font-medium px-6 py-2 rounded transition"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdf8f4] min-h-screen scroll-smooth">
      <AdminHeader onLogout={handleLogout} />

      {mensajeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#f5ede6] text-[#5f4b32] border border-[#c8b29d] px-6 py-3 rounded-xl shadow-md text-sm font-medium z-50 transition-opacity duration-300 animate-fade-in">
          {mensajeToast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section className="mb-16" id="mensajes">
          <div className="flex flex-wrap gap-3 justify-center mb-8">
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
                  <p className="text-sm text-gray-700">{m.email}</p>
                  {m.telefono && <p className="text-sm text-gray-700">📞 {m.telefono}</p>}
                  <p className="mt-2 text-gray-800">{m.mensaje}</p>

                  {m.fechaPropuesta && (
                    <p className="text-sm text-gray-600 mt-2">
                      📅 Fecha propuesta: {m.fechaPropuesta?.toDate().toLocaleDateString("es-ES")} {m.horaPropuesta ? `a las ${m.horaPropuesta}` : ""}
                    </p>
                  )}

                  <p className="mt-2 font-medium text-sm">
                    Estado: <span className={
                      m.estado === "pendiente" ? "text-yellow-600" :
                      m.estado === "aprobada" ? "text-green-700" : "text-red-600"
                    }>{m.estado}</span>
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
                        onClick={async () => {
                          const fecha = m.fechaPropuesta?.toDate().toISOString().split("T")[0];
                          const hora = m.horaPropuesta;

                          await updateDoc(doc(db, "mensajes", m.id), {
                            estado: "rechazada",
                            actualizado: Timestamp.now(),
                          });

                          if (fecha && hora) {
                            await desbloquearHora(fecha, hora);
                          }
                          obtenerMensajes();
                        }}
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

        <section className="mb-16" id="calendario">
          <AppointmentCalendar />
        </section>
      </div>
    </div>
  );
};

export default Admin;














