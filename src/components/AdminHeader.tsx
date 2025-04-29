import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconoLogo from "./IconoLogo";

interface AdminHeaderProps {
  onLogout: () => void;
  showConfiguracion?: boolean;
}

const AdminHeader = ({ onLogout, showConfiguracion = false }: AdminHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname === "/admin";

  const handleScrollTo = (selector: string) => {
    if (isAdminPage) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    } else {
      navigate(`/admin${selector}`);
    }
  };

  return (
    <header className="bg-[#fdf8f4] py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">

        {/* Logo estático sin botón clicable */}
        <div className="flex-1 flex justify-start md:justify-center items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <IconoLogo className="w-full h-full" />
          </div>
        </div>

        {/* Botón cerrar sesión fijo para escritorio */}
        <div className="hidden lg:block fixed top-4 right-6 bg-white px-4 py-2 rounded shadow-md z-50">
          <button
            onClick={onLogout}
            className="text-sm text-[#5f4b32] hover:text-[#b89b71] underline"
          >
            🔓 Cerrar sesión
          </button>
        </div>

        {/* Menú hamburguesa móvil */}
        <div className="absolute right-0 flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-800 text-2xl"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>

        {/* Menú escritorio */}
        <div className="hidden lg:flex justify-between items-center w-full absolute top-1/2 -translate-y-1/2 px-6">
          <ul className="flex gap-6 text-base font-medium text-gray-800 uppercase tracking-wide">
            <li>
              <button onClick={() => handleScrollTo("#mensajes")} className="hover:text-[#b89b71] transition">
                MENSAJES
              </button>
            </li>
            <li>
              <button onClick={() => handleScrollTo("#calendario")} className="hover:text-[#b89b71] transition">
                CALENDARIO
              </button>
            </li>
          </ul>
          <ul className="flex gap-6 text-base font-medium text-gray-800 uppercase tracking-wide ml-auto">
            <li>
              <button onClick={() => navigate("/pacientes")} className="hover:text-[#b89b71] transition">
                HISTORIAL PACIENTES
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/configuracion")} className="hover:text-[#b89b71] transition">
                CONFIGURACIÓN
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 px-4 py-2 space-y-2 text-base font-medium text-gray-800 uppercase tracking-wide divide-y divide-gray-300">
          {[
            { label: "Mensajes", action: () => handleScrollTo("#mensajes") },
            { label: "Calendario", action: () => handleScrollTo("#calendario") },
            { label: "Historial Pacientes", action: () => navigate("/pacientes") },
            { label: "Configuración", action: () => navigate("/configuracion") },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full text-left py-2"
            >
              {label}
            </button>
          ))}

          <button
            onClick={onLogout}
            className="w-full text-left py-2 text-sm text-[#5f4b32] underline"
          >
            🔓 Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;













