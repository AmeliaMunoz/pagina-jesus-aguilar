import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  User,
  CalendarClock,
  SendHorizontal,
  Mail,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";

interface Mensaje {
  id: string;
  uid: string;
  nombre: string;
  email: string;
  texto: string;
  fecha: Date;
  enviadoPorPaciente: boolean;
}

export default function AdminMessagesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

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

  const mensajesPaciente = selectedUid
    ? mensajes.filter((m) => m.uid === selectedUid)
    : [];

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

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto mt-10  px-4">
        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Lista de pacientes */}
            <aside className="w-full lg:w-1/3 border-r border-[#e0d6ca] pr-0 lg:pr-6">
              <h2 className="text-2xl font-semibold mb-4 text-[#5f4b32]">Pacientes</h2>

              {mensajesSinResponder.length > 0 && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 text-sm rounded-md border border-red-300">
                  {mensajesSinResponder.length === 1
                    ? "1 paciente ha enviado un mensaje sin responder"
                    : `${mensajesSinResponder.length} pacientes tienen mensajes sin responder`}
                </div>
              )}

              <ul className="space-y-2">
                {pacientesUnicos.map((p) => {
                  const ultimo = mensajes.filter((m) => m.uid === p.uid).at(-1);
                  const tienePendiente = ultimo?.enviadoPorPaciente === true;

                  return (
                    <li
                      key={p.uid}
                      onClick={() => setSelectedUid(p.uid)}
                      className={`cursor-pointer p-3 rounded-md transition ${
                        selectedUid === p.uid
                          ? "bg-[#b89b71] text-white"
                          : "bg-[#fdf8f4] hover:bg-[#e3d5c2] text-[#5f4b32]"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User size={14} /> {p.nombre}
                        {tienePendiente && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {p.email}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Chat */}
            <section className="w-full lg:w-2/3 flex flex-col justify-between min-h-[500px]">
              {selectedUid ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px] pr-2">
                    {mensajesPaciente.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                          msg.enviadoPorPaciente
                            ? "bg-green-100 self-end ml-auto text-right"
                            : "bg-blue-100 self-start text-left"
                        }`}
                      >
                        <p>{msg.texto}</p>
                        <span className="text-xs text-gray-500 block mt-1 flex items-center gap-1">
                          <CalendarClock size={12} />
                          {msg.fecha.toLocaleString("es-ES")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Input de respuesta */}
                  <div className="mt-2 flex flex-col sm:flex-row gap-3 items-start">
                    <textarea
                      rows={2}
                      placeholder="Escribe una respuesta..."
                      value={respuestas[selectedUid] || ""}
                      onChange={(e) =>
                        setRespuestas((prev) => ({
                          ...prev,
                          [selectedUid]: e.target.value,
                        }))
                      }
                      className="flex-1 border p-3 rounded text-sm"
                    />
                    <button
                      onClick={responder}
                      className="bg-[#5f4b32] text-white px-4 py-2 rounded hover:bg-[#b89b71] disabled:opacity-50 flex items-center justify-center"
                    >
                      <SendHorizontal size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 mt-4 text-sm">
                  Selecciona un paciente para ver su conversación.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}




