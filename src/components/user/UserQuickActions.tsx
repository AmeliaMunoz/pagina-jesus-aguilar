
import { useNavigate } from "react-router-dom";
import { PlusCircle, History, MessageSquareText } from "lucide-react";

const UserQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => navigate("/panel/paciente/reservar")}
        className="flex items-center justify-center gap-2 bg-[#9e7c52] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#b89b71] transition shadow-md"
      >
        <PlusCircle className="w-5 h-5" /> Reservar nueva cita
      </button>

      <button
        onClick={() => navigate("/panel/paciente/historial")}
        className="flex items-center justify-center gap-2 border border-[#5f4b32] text-[#5f4b32] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#f3ece4] transition shadow-sm"
      >
        <History className="w-5 h-5" /> Ver historial
      </button>

      <button
        onClick={() => navigate("/panel/paciente/mensajes")}
        className="flex items-center justify-center gap-2 border border-[#5f4b32] text-[#5f4b32] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#f3ece4] transition shadow-sm"
      >
        <MessageSquareText className="w-5 h-5" /> Ir a mensajes
      </button>
    </div>
  );
};

export default UserQuickActions;
