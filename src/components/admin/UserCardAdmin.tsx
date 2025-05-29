
import { Mail } from "lucide-react";

interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  activo?: boolean;
}

interface Props {
  usuario: Usuario;
  onChangeStatus: (usuario: Usuario, estado: boolean) => void;
}

const UserCardAdmin = ({ usuario, onChangeStatus }: Props) => {
  return (
    <div className="border border-[#e0d6ca] rounded-xl p-6 bg-[#fdf8f4] shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 break-words">
      <div>
        <p className="font-medium text-[#5f4b32] text-base">
          {usuario.nombre}{" "}
          {usuario.activo === false && (
            <span className="text-red-500 text-sm">(desactivado)</span>
          )}
        </p>
        <p className="text-sm text-gray-700 flex items-start gap-1 break-all">
          <Mail size={14} /> <span className="break-all">{usuario.email}</span>
        </p>
        {usuario.telefono && (
          <p className="text-sm text-gray-700">{usuario.telefono}</p>
        )}
      </div>
      <div className="flex gap-4 flex-wrap">
        {usuario.activo === false ? (
          <button
            onClick={() => onChangeStatus(usuario, true)}
            className="text-sm text-green-700 hover:text-green-900 underline"
          >
            Activar
          </button>
        ) : (
          <button
            onClick={() => onChangeStatus(usuario, false)}
            className="text-sm text-yellow-700 hover:text-yellow-900 underline"
          >
            Desactivar
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCardAdmin;
