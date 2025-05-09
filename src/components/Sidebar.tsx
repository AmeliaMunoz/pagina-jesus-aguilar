import { NavLink } from "react-router-dom";
import { ReactNode, useState } from "react";
import Logo from "./IconoLogo";
import { LogOut, Menu, X, Home } from "lucide-react";

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

interface Props {
  title: string;
  items: NavItem[];
  onLogout?: () => void;
}

const Sidebar = ({ title, items, onLogout }: Props) => {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    setOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa en móviles */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setOpen(!open)} className="p-2 rounded bg-[#f5ede3] shadow">
          {open ? <X className="text-[#5f4b32] w-6 h-6" /> : <Menu className="text-[#5f4b32] w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
  className={`
    fixed top-0 left-0 h-screen w-64 bg-[#735035] text-white px-6 py-8 flex flex-col justify-between z-40 transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"} 
    md:translate-x-0 md:static md:block
  `}
>
  {/* Contenido superior: logo + navegación */}
  <div>
    <div className="flex items-center gap-4 mb-10">
      <div className="w-24 h-24">
        <Logo className="text-white" />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>

    <nav className="flex flex-col gap-4">
      {/* Botón inicio */}
      <NavLink
        to="/panel/paciente/user"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition text-md ${
            isActive ? "bg-[#4e3e29]" : "hover:bg-[#4e3e29]/80"
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Inicio</span>
      </NavLink>

      {/* Navegación dinámica */}
      {items.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={() => setOpen(false)}
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

  {/* Botón cerrar sesión abajo del todo */}
  <div className="pt-4">
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
    >
      <LogOut size={16} /> Cerrar sesión
    </button>
  </div>
</aside>

    </>
  );
};

export default Sidebar;




