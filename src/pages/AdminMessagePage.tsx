import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Mail,
  User,
  CalendarClock,
  SendHorizontal,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

interface Mensaje {
  id: string;
  uid: string;
  nombre: string;
  email: string;
  texto: string;
  fecha: Date;
}

const AdminMessagesPage = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => {
    const fetchMensajes = async () => {
      const q = query(collection(db, "mensajes"), orderBy("fecha", "desc"));
      const snapshot = await getDocs(q);

      const mensajesFormateados = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          nombre: data.nombre,
          email: data.email,
          texto: data.texto,
          fecha: data.fecha.toDate(),
        };
      });

      setMensajes(mensajesFormateados);
    };

    fetchMensajes();
  }, []);

  const handleResponder = async (msg: Mensaje) => {
    const respuesta = respuestas[msg.id]?.trim();
    if (!respuesta) return;

    setEnviando(msg.id);

    await addDoc(collection(db, "mensajes"), {
      uid: msg.uid,
      nombre: "Psicólogo",
      email: "admin@centropsico.com",
      texto: respuesta,
      fecha: Timestamp.now(),
      enviadoPorPaciente: false,
    });

    setRespuestas((prev) => ({ ...prev, [msg.id]: "" }));
    setEnviando(null);
    window.location.reload(); // Refresca la conversación
  };

  return (
    <div className="flex bg-[#f5ede3] min-h-screen">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-6 bg-[#fdf8f4]">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-[#5f4b32] mb-6">
            Mensajes Privados de Pacientes
          </h2>

          {mensajes.length === 0 ? (
            <p className="text-gray-600">No hay mensajes disponibles.</p>
          ) : (
            <ul className="space-y-6">
              {mensajes.map((msg) => (
                <li
                  key={msg.id}
                  className="bg-[#fdf8f4] p-5 rounded-xl shadow border border-[#e3d5c2]"
                >
                  <p className="text-[#5f4b32] font-semibold flex items-center gap-2">
                    <User size={16} /> {msg.nombre} ({msg.email})
                  </p>
                  <p className="text-sm mt-2 text-gray-800">{msg.texto}</p>
                  <p className="text-xs mt-2 flex items-center gap-2 text-gray-500">
                    <CalendarClock size={14} />
                    {msg.fecha.toLocaleString("es-ES")}
                  </p>

                  {/* Campo de respuesta */}
                  <div className="mt-4 flex gap-2 items-start">
                    <textarea
                      rows={2}
                      placeholder="Responder al paciente..."
                      value={respuestas[msg.id] || ""}
                      onChange={(e) =>
                        setRespuestas((prev) => ({
                          ...prev,
                          [msg.id]: e.target.value,
                        }))
                      }
                      className="flex-1 border p-2 rounded text-sm"
                    />
                    <button
                      onClick={() => handleResponder(msg)}
                      disabled={!respuestas[msg.id]?.trim() || enviando === msg.id}
                      className="bg-[#5f4b32] text-white p-2 rounded hover:bg-[#b89b71] disabled:opacity-50"
                    >
                      <SendHorizontal size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMessagesPage;



