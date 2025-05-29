import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  getDocs,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout";
import DeleteConfirmationModal from "../components/admin/DeleteConfirmationModal";
import MessageThread from "../components/admin/MessageThread";
import ConversationList from "../components/admin/ConversationList";

interface Mensaje {
  id: string;
  uid: string;
  nombre: string;
  email: string;
  texto: string;
  fecha: Date;
  enviadoPorPaciente: boolean;
}

export default function AdminMessagesChatPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<{ uid: string; nombre: string } | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, "mensajes"), orderBy("fecha", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          uid: d.uid,
          nombre: d.nombre,
          email: d.email,
          texto: d.texto,
          fecha: d.fecha.toDate(),
          enviadoPorPaciente: d.enviadoPorPaciente,
        };
      });
      setMensajes(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, selectedUid]);

  const pacientesUnicos = Array.from(
    new Map(
      mensajes
        .filter((m) => m.enviadoPorPaciente)
        .map((m) => [m.uid, { uid: m.uid, nombre: m.nombre, email: m.email }])
    ).values()
  );

  const mensajesSinResponder = pacientesUnicos.filter((paciente) => {
    const mensajesPaciente = mensajes.filter((m) => m.uid === paciente.uid);
    if (mensajesPaciente.length === 0) return false;
    const ultimo = mensajesPaciente[mensajesPaciente.length - 1];
    return ultimo?.enviadoPorPaciente === true;
  });

  const mensajesPaciente = selectedUid ? mensajes.filter((m) => m.uid === selectedUid) : [];

  const responder = async () => {
    const texto = respuestas[selectedUid ?? ""]?.trim();
    if (!texto || !selectedUid) return;

    await addDoc(collection(db, "mensajes"), {
      uid: selectedUid,
      nombre: "Psicólogo",
      email: "admin@cadmin.com",
      texto,
      fecha: Timestamp.now(),
      enviadoPorPaciente: false,
    });

    setRespuestas((prev) => ({ ...prev, [selectedUid]: "" }));
  };

  const eliminarConversacion = async (uid: string) => {
    const q = query(collection(db, "mensajes"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    for (const docu of snapshot.docs) {
      await deleteDoc(doc(db, "mensajes", docu.id));
    }
    if (selectedUid === uid) {
      setSelectedUid(null);
    }
    setMostrarConfirmacion(null);
    alert(`🗑️ Conversación eliminada (${snapshot.docs.length} mensajes).`);
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto mt-10 px-4 overflow-x-hidden">
        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-6">
            <ConversationList
              pacientesUnicos={pacientesUnicos}
              mensajes={mensajes}
              mensajesSinResponder={mensajesSinResponder}
              selectedUid={selectedUid}
              setSelectedUid={setSelectedUid}
              setMostrarConfirmacion={setMostrarConfirmacion}
            />

            <MessageThread
              selectedUid={selectedUid}
              mensajesPaciente={mensajesPaciente}
              respuestas={respuestas}
              setRespuestas={setRespuestas}
              responder={responder}
              endRef={endRef}
            />
          </div>
        </div>

        {mostrarConfirmacion && (
          <DeleteConfirmationModal
            mostrarConfirmacion={mostrarConfirmacion}
            onConfirm={() => eliminarConversacion(mostrarConfirmacion.uid)}
            onCancel={() => setMostrarConfirmacion(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}