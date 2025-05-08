import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import {
  Mail,
  Ticket,
  Plus,
  BarChartHorizontal,
  CalendarClock,
  SendHorizontal,
} from "lucide-react";

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <CalendarClock /> },
  { label: "Mi bono", path: "/panel/paciente/bono", icon: <Ticket /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <BarChartHorizontal /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

const PatientMessagesPage = () => {
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const fetchMensajes = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDocs(
        query(collection(db, "usuarios"), where("uid", "==", user.uid))
      );
      const docData = userDoc.docs[0]?.data();
      setNombre(docData?.nombre || "");

      const q = query(
        collection(db, "mensajes"),
        where("uid", "==", user.uid),
        orderBy("fecha", "desc")
      );

      const snapshot = await getDocs(q);
      const datos = snapshot.docs.map((doc) => doc.data());
      setMensajes(datos);
    };

    fetchMensajes();
  }, []);

  const handleEnviar = async () => {
    const user = auth.currentUser;
    if (!user || !nuevoMensaje.trim()) return;
    setEnviando(true);

    await addDoc(collection(db, "mensajes"), {
      uid: user.uid,
      nombre: user.displayName || "",
      email: user.email,
      texto: nuevoMensaje.trim(),
      fecha: Timestamp.now(),
      enviadoPorPaciente: true,
    });

    setNuevoMensaje("");
    setEnviando(false);
    window.location.reload();
  };

  return (
    <div className="flex bg-[#f5ede3] min-h-screen">
      <Sidebar title="Paciente" items={pacienteNav} onLogout={() => auth.signOut()} />

      <main className="flex-1 bg-[#fdf8f4] px-6 sm:px-8 md:px-12 py-12 flex flex-col items-center justify-center relative">
        {/* Saludo */}
        <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 w-full max-w-3xl text-center md:text-left">
          {nombre}
        </h1>

        {/* Tarjeta exterior */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-10">
          {/* Tarjeta interior */}
          <div className="bg-white border border-[#e0d6ca] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#5f4b32]">Mensajes con tu psicólogo</h2>
              <Mail className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6">
              {mensajes.length === 0 ? (
                <p className="text-gray-600 text-sm">No has enviado ningún mensaje aún.</p>
              ) : (
                mensajes.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-md text-sm shadow-sm max-w-[80%] ${
                      msg.enviadoPorPaciente
                        ? "bg-[#f5ede3] text-right ml-auto"
                        : "bg-[#e9e2d7] text-left mr-auto"
                    }`}
                  >
                    <p>{msg.texto}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.fecha?.toDate().toLocaleString("es-ES")}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                className="flex-1 border rounded p-2 text-sm"
                rows={2}
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe tu mensaje para el terapeuta..."
              />
              <button
                onClick={handleEnviar}
                disabled={enviando || !nuevoMensaje.trim()}
                className="bg-[#5f4b32] text-white p-2 rounded hover:bg-[#b89b71] disabled:opacity-50"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientMessagesPage;

