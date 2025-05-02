import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconoLogo from "./IconoLogo";
import { LogOut, Menu } from "lucide-react";

const AdminHeader = ({ onLogout }: { onLogout: () => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("admin-autenticado"); 
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-[#fdf8f4] py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
     
        <div className="flex-1 flex justify-center items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <IconoLogo className="w-full h-full" />
          </div>
        </div>

        <div className="hidden lg:block fixed top-4 right-6 bg-white px-4 py-2 rounded shadow-md z-50">
          <button
            onClick={onLogout}
            className="text-sm text-[#5f4b32] hover:text-[#b89b71] underline"
          >
            <LogOut size={16} className="inline mr-1" />
            Cerrar sesión
          </button>
        </div>

        <div className="absolute right-0 flex items-center lg:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-800">
            <Menu size={28} />
          </button>
        </div>

        <div className="hidden lg:flex justify-between items-center w-full absolute top-1/2 -translate-y-1/2 px-6">
          <ul className="flex gap-6 text-base font-medium text-gray-800 uppercase tracking-wide">
            <li><button onClick={() => handleScrollTo("#mensajes")} className="hover:text-[#b89b71]">MENSAJES</button></li>
            <li><button onClick={() => handleScrollTo("#calendario")} className="hover:text-[#b89b71]">CALENDARIO</button></li>
          </ul>
          <ul className="flex gap-6 text-base font-medium text-gray-800 uppercase tracking-wide ml-auto">
            <li><button onClick={() => navigate("/pacientes")} className="hover:text-[#b89b71]">HISTORIAL</button></li>
            <li><button onClick={() => navigate("/configuracion")} className="hover:text-[#b89b71]">CONFIGURACIÓN</button></li>
          </ul>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 px-4 py-2 space-y-2 text-base text-gray-800 uppercase tracking-wide divide-y divide-gray-300">
          {[
            { label: "Mensajes", action: () => handleScrollTo("#mensajes") },
            { label: "Calendario", action: () => handleScrollTo("#calendario") },
            { label: "Historial", action: () => navigate("/pacientes") },
            { label: "Configuración", action: () => navigate("/configuracion") },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} className="w-full text-left py-2">
              {label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="w-full text-left py-2 text-sm text-[#5f4b32] flex items-center gap-2"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;


















