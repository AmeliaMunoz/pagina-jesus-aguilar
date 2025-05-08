import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import {
  Calendar,
  Ticket,
  Clock,
  Plus,
  Mail,
  AlertCircle,
  CalendarCheck2,
} from "lucide-react";

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <Calendar /> },
  { label: "Mi bono", path: "/panel/paciente/bono", icon: <Ticket /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <Clock /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  anuladaPorUsuario: boolean;
}

const NextAppointmentPage = () => {
  const [nombre, setNombre] = useState("");
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajeEnviado, setMensajeEnviado] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setNombre(data.nombre || "");
      }

      const q = query(
        collection(db, "citas"),
        where("uid", "==", currentUser.uid),
        where("estado", "==", "pendiente"),
        orderBy("fecha")
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const citaDoc = snapshot.docs[0];
        const data = citaDoc.data();
        setProximaCita({
          id: citaDoc.id,
          fecha: data.fecha ?? "",
          hora: data.hora ?? "",
          estado: data.estado ?? "",
          anuladaPorUsuario: data.anuladaPorUsuario ?? false,
        });
      }
    };

    fetchData();
  }, [navigate]);

  const anularCita = async () => {
    setError("");
    setSuccess("");

    if (!proximaCita) return;

    const citaFecha = new Date(`${proximaCita.fecha}T${proximaCita.hora}`);
    const ahora = new Date();
    const horasRestantes = (citaFecha.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24) {
      setError("No puedes anular la cita. Faltan menos de 24h.");
      return;
    }

    await updateDoc(doc(db, "citas", proximaCita.id), {
      estado: "anulada",
      anuladaPorUsuario: true,
    });

    setProximaCita(null);
    setSuccess("Cita anulada correctamente.");
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim() || !proximaCita) return;

    await updateDoc(doc(db, "citas", proximaCita.id), {
      mensajeDelPaciente: mensaje.trim(),
    });

    setMensaje("");
    setMensajeEnviado(true);
  };

  return (
    <div className="flex bg-[#f5ede3] min-h-screen">
      <Sidebar
        title=""
        items={pacienteNav}
        onLogout={() => {
          auth.signOut();
          navigate("/login");
        }}
      />

<main className="flex-1 bg-[#fdf8f4] px-6 sm:px-10 md:px-16 py-12 flex flex-col items-center justify-center relative">
          {/* Saludo */}
          <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 w-full max-w-3xl text-center md:text-left">
            {nombre}
          </h1>

          {/* Tarjeta exterior */}
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-10">
            {/* Tarjeta interior */}
            <div className="bg-white border border-[#e0d6ca] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#5f4b32]">Tu próxima cita</h2>
                <CalendarCheck2 className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
              </div>

              {proximaCita ? (
                <>
                  <div className="mb-4 text-sm text-[#5f4b32] space-y-2">
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(proximaCita.fecha).toLocaleDateString("es-ES")} a las{" "}
                      {proximaCita.hora}
                    </p>
                    <p>
                      <strong>Estado:</strong> {proximaCita.estado}
                    </p>
                  </div>

                  <button
                    onClick={anularCita}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mb-6"
                  >
                    Anular cita
                  </button>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      ¿Quieres compartir algo antes de la sesión?
                    </label>
                    <textarea
                      className="w-full border rounded p-2 text-sm"
                      rows={3}
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Por ejemplo: me gustaría hablar sobre lo que pasó el fin de semana..."
                    />
                    <button
                      onClick={enviarMensaje}
                      className="mt-2 px-4 py-1 bg-[#5f4b32] text-white rounded hover:bg-[#b89b71]"
                    >
                      Enviar mensaje
                    </button>
                    {mensajeEnviado && (
                      <p className="text-green-600 text-sm mt-2">
                        Mensaje enviado correctamente.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-[#5f4b32] text-sm">
                  <AlertCircle className="w-5 h-5" />
                  No tienes ninguna cita pendiente.
                </div>
              )}

              {error && (
                <div className="mt-4 text-red-600 text-sm bg-red-100 border border-red-300 rounded p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 text-green-700 text-sm bg-green-100 border border-green-300 rounded p-3">
                  {success}
                </div>
              )}
            </div>
          </div>
        </main>
    </div>
  );
};

export default NextAppointmentPage;




