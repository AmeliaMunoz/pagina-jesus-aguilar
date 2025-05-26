import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/UserSidebar";
import HamburgerButton from "../components/HamburgerButton";
import UserHeader from "../components/UserHeader";
import {
  CalendarClock,
  BarChartHorizontal,
  Plus,
  Mail,
} from "lucide-react";

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <CalendarClock /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <BarChartHorizontal /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

interface Props {
  children: ReactNode;
}

const UserLayout = ({ children }: Props) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#fdf8f4] overflow-hidden">
      {/* Sidebar fijo */}
      <Sidebar
        title=""
        items={pacienteNav}
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={() => {
          localStorage.removeItem("user-autenticado");
          window.location.href = "/login";
        }}
      />

      {/* Contenido */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <HamburgerButton
          isOpen={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
        />

        {/* Header del usuario */}
        <UserHeader />

        {/* Contenido principal */}
        <main className="flex-1 py-12 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 3xl:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;


