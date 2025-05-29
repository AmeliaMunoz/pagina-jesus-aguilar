import { Mail, User } from "lucide-react";

interface Paciente {
  uid: string;
  nombre: string;
  email: string;
}

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
  pacientesUnicos: Paciente[];
  mensajes: Mensaje[];
  mensajesSinResponder: Paciente[];
  selectedUid: string | null;
  setSelectedUid: (uid: string) => void;
  setMostrarConfirmacion: (confirm: { uid: string; nombre: string } | null) => void;
}

const ConversationList = ({
  pacientesUnicos,
  mensajes,
  mensajesSinResponder,
  selectedUid,
  setSelectedUid,
  setMostrarConfirmacion,
}: Props) => {
  return (
    <aside className="w-full lg:w-1/3 lg:border-r border-[#e0d6ca] pr-0 lg:pr-6 break-words">
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
              onContextMenu={(e) => {
                e.preventDefault();
                setMostrarConfirmacion({ uid: p.uid, nombre: p.nombre });
              }}
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
              <div className="text-xs text-gray-600 flex items-start gap-1 mt-1 break-all">
                <Mail size={12} /> <span className="break-all">{p.email}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default ConversationList;
