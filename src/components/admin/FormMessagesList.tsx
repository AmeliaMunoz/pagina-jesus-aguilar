
import { Mail } from "lucide-react";

interface Props {
  mensajes: {
    id: string;
    nombre: string;
    email: string;
    fechaPropuesta?: Date;
    horaPropuesta?: string;
  }[];
}

const FormMessagesList = ({ mensajes }: Props) => {
  if (mensajes.length === 0) {
    return <p className="text-gray-600 text-sm">No hay mensajes pendientes del formulario.</p>;
  }

  return (
    <ul className="space-y-3">
      {mensajes.map((msg) => (
        <li
          key={msg.id}
          className="p-3 md:p-4 3xl:p-6 rounded-lg shadow-sm border bg-[#fdf8f4] border-[#f3d4a3] flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm md:text-base 3xl:text-lg text-[#5f4b32]"
        >
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>
              {msg.nombre} — {msg.email} — {msg.fechaPropuesta?.toLocaleDateString("es-ES")}{" "}
              {msg.horaPropuesta && `a las ${msg.horaPropuesta}`}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FormMessagesList;
