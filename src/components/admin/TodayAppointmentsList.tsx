
import { Clock } from "lucide-react";

interface Props {
  citas: {
    id: string;
    nombre: string;
    email: string;
    horaPropuesta?: string;
    estado?: string;
  }[];
}

const TodayAppointmentsList = ({ citas }: Props) => {
  if (citas.length === 0) {
    return <p className="text-gray-600 text-sm">No hay citas para hoy.</p>;
  }

  return (
    <ul className="space-y-3">
      {citas.map((cita) => (
        <li
          key={cita.id}
          className={`p-3 md:p-4 3xl:p-6 rounded-lg shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
            cita.estado === "ausente"
              ? "bg-yellow-100 border-yellow-300"
              : "bg-[#fdf8f4] border-[#e0d6ca]"
          }`}
        >
          <div className="flex items-center gap-2 text-sm md:text-base 3xl:text-lg text-[#5f4b32]">
            <Clock size={16} />
            <span>
              {cita.horaPropuesta} — {cita.nombre} ({cita.email})
            </span>
          </div>
          <span
            className={`text-sm 3xl:text-base font-medium ${
              cita.estado === "ausente" ? "text-yellow-800" : "text-green-700"
            }`}
          >
            {cita.estado === "ausente" ? "Ausente" : "Confirmada"}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default TodayAppointmentsList;
