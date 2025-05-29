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
import { Mail} from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import { onAuthStateChanged } from "firebase/auth";
import PatientMessageInput from "../components/user/PatientMessageInput";
import PatientMessageBubble from "../components/user/PatientMessageBubble";

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
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubscribeMensajes: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setUid(user.uid);
      setEmail(user.email || "");

      const userDoc = await getDocs(
        query(collection(db, "usuarios"), where("uid", "==", user.uid))
      );
      const docData = userDoc.docs[0]?.data();
      setNombre(docData?.nombre || user.displayName || "");

      const q = query(collection(db, "mensajes"), where("uid", "==", user.uid));
      unsubscribeMensajes = onSnapshot(q, (snapshot) => {
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
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMensajes) unsubscribeMensajes();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!uid || !email || !nombre || !nuevoMensaje.trim()) return;

    setEnviando(true);
    try {
      await addDoc(collection(db, "mensajes"), {
        uid,
        nombre,
        email,
        texto: nuevoMensaje.trim(),
        fecha: Timestamp.now(),
        enviadoPorPaciente: true,
      });
      setNuevoMensaje("");
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <UserLayout>
      <div className="w-full max-w-4xl mx-auto mt-10 px-4 space-y-10">
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
                  <PatientMessageBubble
                    key={msg.id}
                    texto={msg.texto}
                    fecha={msg.fecha}
                    enviadoPorPaciente={msg.enviadoPorPaciente}
                  />
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <PatientMessageInput
              value={nuevoMensaje}
              onChange={setNuevoMensaje}
              onSend={handleEnviar}
              loading={enviando}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PatientMessagesPage;
