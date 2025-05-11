import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
import Logo from "./IconoLogo";
import { LogOut, Home } from "lucide-react";

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

interface Props {
  title: string;
  items: NavItem[];
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const UserSidebar = ({ title, items, onLogout, isOpen = false, onClose }: Props) => {
  const handleLogout = () => {
    if (onLogout) onLogout();
    if (onClose) onClose();
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-[#735035] text-white px-6 py-8 z-40
        transition-transform duration-300 overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex lg:flex-col lg:justify-between
      `}
    >
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-24 h-24">
              <Logo className="text-white" />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>

          <nav className="flex flex-col gap-4">
            <NavLink
              to="/panel/paciente/user"
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition text-md ${
                  isActive ? "bg-[#4e3e29]" : "hover:bg-[#4e3e29]/80"
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span>Inicio</span>
            </NavLink>

            {items.map(({ label, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition text-md ${
                    isActive ? "bg-[#4e3e29]" : "hover:bg-[#4e3e29]/80"
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
      </div>
    </aside>
  );
};

export default UserSidebar;






