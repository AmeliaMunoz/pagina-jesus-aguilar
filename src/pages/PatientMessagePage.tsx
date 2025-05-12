import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import {
  Mail,
  SendHorizontal,
} from "lucide-react";
import UserLayout from "../layouts/UserLayout";

const PatientMessagesPage = () => {
  const [mensajes, setMensajes] = useState<any[]>([]);
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
      where("uid", "==", user.uid),
      orderBy("fecha", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
        fecha: Timestamp.now(),
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
      <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 text-center md:text-left">
        {nombre}
      </h1>

      <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
        <div className="bg-white border border-[#e0d6ca] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#5f4b32]">
              Mensajes con tu psicólogo
            </h2>
            <Mail className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
          </div>

          {/* Lista de mensajes */}
          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto mb-6">
            {mensajes.length === 0 ? (
              <p className="text-gray-600 text-sm">No has enviado ningún mensaje aún.</p>
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
                    {msg.fecha?.toDate().toLocaleString("es-ES")}
                  </p>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* Input de envío */}
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
    </UserLayout>
  );
};

export default PatientMessagesPage;








