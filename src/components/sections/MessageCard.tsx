import { CalendarDays, Mail, Phone } from "lucide-react";

interface Props {
  mensaje: any;
  filtroEstado: string;
  onAprobar: () => void;
  onRechazar: () => void;
  onEliminar: () => void;
}

const MessageCard = ({ mensaje: m, filtroEstado, onAprobar, onRechazar, onEliminar }: Props) => {
  return (
    <div className="w-full bg-[#fdf8f4] border border-[#e8d4c3] rounded-xl shadow-sm p-4 sm:p-6 break-words">
      <p className="text-sm text-gray-500 mb-1">
        {m.creado?.toDate().toLocaleString()}
      </p>
      <h3 className="text-lg font-semibold text-gray-800 break-words">{m.nombre}</h3>

      <p className="text-sm text-gray-700 flex items-center gap-2 mt-2 break-all">
        <Mail size={16} /> {m.email}
      </p>

      {m.telefono && (
        <p className="text-sm text-gray-700 flex items-center gap-2 mt-2">
          <Phone size={16} /> {m.telefono}
        </p>
      )}

      {m.fechaPropuesta && (
        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
          <CalendarDays size={16} />
          Fecha propuesta:{" "}
          {m.fechaPropuesta.toDate().toLocaleDateString("es-ES")}{" "}
          {m.horaPropuesta && `a las ${m.horaPropuesta}`}
        </p>
      )}

      {m.mensaje && <p className="mt-2 text-gray-800 break-words">{m.mensaje}</p>}

      <p className="mt-2 font-medium text-sm">
        Estado:{" "}
        <span
          className={
            m.estado === "pendiente"
              ? "text-yellow-600"
              : m.estado === "aprobada"
              ? "text-green-700"
              : "text-red-600"
          }
        >
          {m.estado}
        </span>
      </p>

      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:justify-start sm:items-start gap-4">
        {filtroEstado !== "todos" && (
          <>
            <button
              onClick={onAprobar}
              className="w-full sm:w-auto px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              Aprobar
            </button>
            <button
              onClick={onRechazar}
              className="w-full sm:w-auto px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Rechazar
            </button>
          </>
        )}
        <button
          onClick={onEliminar}
          className="w-full sm:w-auto px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 text-sm"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default MessageCard;
