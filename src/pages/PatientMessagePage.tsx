import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { Mail, SendHorizontal } from "lucide-react";
import UserLayout from "../layouts/UserLayout";

// ✅ Interfaz segura para cada mensaje
interface Mensaje {
  id: string;
  texto: string;
  fecha: Timestamp | string;
  enviadoPorPaciente: boolean;
}

const PatientMessagesPage = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [nombre, setNombre] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchNombre = async () => {
      const userDoc = await getDocs(
        query(collection(db, "usuarios"), where("uid", "==", user.uid))
      );
      const docData = userDoc.docs[0]?.data();
      setNombre(docData?.nombre || user.displayName || "");
    };

    const q = query(
      collection(db, "mensajes"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: Mensaje[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            texto: data.texto,
            fecha: data.fecha,
            enviadoPorPaciente: data.enviadoPorPaciente,
          };
        })
        .sort((a, b) => {
          const aFecha = a.fecha instanceof Timestamp ? a.fecha.toDate() : new Date(a.fecha);
          const bFecha = b.fecha instanceof Timestamp ? b.fecha.toDate() : new Date(b.fecha);
          return aFecha.getTime() - bFecha.getTime();
        });

      setMensajes(datos);
    });

    fetchNombre();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Usuario no autenticado");
    if (!nuevoMensaje.trim()) return alert("Mensaje vacío");

    setEnviando(true);

    try {
      await addDoc(collection(db, "mensajes"), {
        uid: user.uid,
        nombre: nombre || user.displayName || "Paciente",
        email: user.email,
        texto: nuevoMensaje.trim(),
        fecha: Timestamp.now(), // ✅ fecha correcta
        enviadoPorPaciente: true,
      });
      setNuevoMensaje("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <UserLayout>
      <div className="w-full max-w-4xl mx-auto mt-10 px-4 space-y-10">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
            <div className="bg-white border border-[#e0d6ca] rounded-xl p-6 flex flex-col space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-[#5f4b32]">
                  Mensajes con tu psicólogo
                </h2>
                <Mail className="hidden lg:block w-8 h-8 text-[#5f4b32]" />
              </div>

              {/* Lista de mensajes */}
              <div className="flex flex-col gap-3 max-h-[60vh] md:max-h-[350px] overflow-y-auto">
                {mensajes.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    No has enviado ningún mensaje aún.
                  </p>
                ) : (
                  mensajes.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                        msg.enviadoPorPaciente
                          ? "bg-blue-100 text-blue-800 self-end text-right"
                          : "bg-green-100 text-green-800 self-start text-left"
                      }`}
                    >
                      <p>{msg.texto}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.fecha instanceof Timestamp
                          ? msg.fecha.toDate().toLocaleString("es-ES")
                          : new Date(msg.fecha).toLocaleString("es-ES")}
                      </p>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              {/* Input de envío */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <textarea
                  className="flex-1 border rounded p-3 text-sm"
                  rows={2}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje para el terapeuta..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleEnviar();
                    }
                  }}
                />
                <button
                  onClick={handleEnviar}
                  disabled={enviando || !nuevoMensaje.trim()}
                  className="bg-[#5f4b32] text-white px-4 py-2 rounded hover:bg-[#b89b71] disabled:opacity-50 flex items-center justify-center"
                >
                  <SendHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PatientMessagesPage;











