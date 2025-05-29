import { CalendarClock } from "lucide-react";

interface Mensaje {
    id: string;
    uid: string;
    nombre: string;
    email: string;
    texto: string;
    fecha: Date;
    enviadoPorPaciente: boolean;
  }
interface Props {
  selectedUid: string | null;
  mensajesPaciente: Mensaje[];
  respuestas: Record<string, string>;
  setRespuestas: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  responder: () => Promise<void>;
  endRef: React.RefObject<HTMLDivElement | null>;
}

const MessageThread = ({
  selectedUid,
  mensajesPaciente,
  respuestas,
  setRespuestas,
  responder,
  endRef,
}: Props) => {
  return (
    <section className="w-full lg:w-2/3 flex flex-col justify-between min-h-[500px]">
      {selectedUid ? (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px] pr-2">
            {mensajesPaciente.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-full sm:max-w-[80%] px-4 py-2 rounded-xl text-sm break-words ${
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
            <div ref={endRef} />
          </div>

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  responder();
                }
              }}
              className="flex-1 border p-3 rounded text-sm"
            />
            <button
              onClick={responder}
              className="bg-[#5f4b32] text-white px-4 py-2 rounded hover:bg-[#b89b71] disabled:opacity-50 flex items-center justify-center"
            >
              Enviar
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600 mt-4 text-sm">
          Selecciona un paciente para ver su conversación.
        </p>
      )}
    </section>
  );
};

export default MessageThread;


