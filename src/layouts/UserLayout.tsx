import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/UserSidebar";
import HamburgerButton from "../components/HamburgerButton";
import {
  CalendarClock,
  Ticket,
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
    setSidebarVisible(false); // Cierra al cambiar ruta
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#fdf8f4] overflow-x-hidden">
      <HamburgerButton
        isOpen={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      <Sidebar
        title=""
        items={pacienteNav}
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={() => {
          localStorage.removeItem("admin-autenticado");
          window.location.href = "/login";
        }}
      />

      <main className="w-full min-h-screen px-4 sm:px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
};

export default UserLayout;
