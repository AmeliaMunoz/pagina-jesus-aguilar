
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import IconoLogo from "./IconoLogo";

const adminNav = [
  { label: "Mensajes formulario", path: "/admin/mensajes" },
  { label: "Mensajes pacientes", path: "/admin/mensajes-pacientes" },
  { label: "Citas", path: "/admin/citas" },
  { label: "Crear usuario", path: "/admin/crear-usuario" },
  { label: "Historial", path: "/admin/pacientes" },
  { label: "Configuración", path: "/admin/configuracion" },
  { label: "Estadísticas", path: "/admin/estadisticas" },
];

const AdminSidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem("admin-autenticado");
    window.location.href = "/admin";
  };

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 overflow-y-auto bg-[#735035] text-white px-6 py-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-25 h-25">
            <IconoLogo className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Admin</h2>
        </div>

        <nav className="flex flex-col gap-4">
          {adminNav.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-md transition ${
                  isActive ? "bg-[#4e3e29]" : "hover:bg-[#4e3e29]/70"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </aside>
  );
};

export default AdminSidebar;

