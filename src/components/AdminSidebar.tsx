import { NavLink } from "react-router-dom";
import {
  Home,
  Mail,
  Users,
  Calendar,
  UserPlus,
  Archive,
  Settings,
  BarChart,
  LogOut,
} from "lucide-react";
import IconoLogo from "./IconoLogo";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const adminNav = [
  { label: "Mensajes formulario", path: "/admin/mensajes", icon: <Mail /> },
  { label: "Mensajes pacientes", path: "/admin/mensajes-pacientes", icon: <Users /> },
  { label: "Citas", path: "/admin/citas", icon: <Calendar /> },
  { label: "Crear usuario", path: "/admin/crear-usuario", icon: <UserPlus /> },
  { label: "Historial", path: "/admin/pacientes", icon: <Archive /> },
  { label: "Configuración", path: "/admin/configuracion", icon: <Settings /> },
  { label: "Estadísticas", path: "/admin/estadisticas", icon: <BarChart /> },
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ isOpen = false, onClose }: Props) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("admin-autenticado");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

    if (onClose) onClose();
  };

  return (
<aside
  className={`
    fixed top-0 left-0 h-screen w-80 bg-[#9f8a6d] text-white px-6 py-8 z-40
    transition-transform duration-300 overflow-y-auto
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static lg:flex lg:flex-col lg:justify-between
  `}
>
  <div>
    <div className="flex items-center gap-4 mb-10">
      <div className="w-24 h-24">
        <IconoLogo className="text-white" />
      </div>
      <h2 className="text-xl font-bold">Admin</h2>
    </div>

    <nav className="flex flex-col gap-4">
      <NavLink
        to="/admin"
        end
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition text-md ${
             isActive ? "bg-[#c1b5a4]" : "hover:bg-[#c1b5a4]"
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Inicio</span>
      </NavLink>

      {adminNav.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition text-md ${
             isActive ? "bg-[#c1b5a4]" : "hover:bg-[#c1b5a4]"
            }`
          }
        >
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </div>

  <div className="pt-6 border-white/20">
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-white/80 hover:text-white mt-4"
    >
      <LogOut size={16} /> Cerrar sesión
    </button>
  </div>
</aside>

  );
};

export default AdminSidebar;











