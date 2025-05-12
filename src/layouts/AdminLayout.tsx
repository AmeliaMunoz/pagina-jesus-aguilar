import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import HamburgerButton from "../components/HamburgerButton";
import { auth, signOut } from "../firebase"; // 🔐 Asegúrate de importar esto

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirigir si no hay sesión admin
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin-autenticado");
    if (!isAuthenticated) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Cierra sidebar al cambiar de ruta
  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  // 🔐 Cierre de sesión automático al cerrar pestaña o recargar
  useEffect(() => {
    const handleUnload = async () => {
      try {
        await signOut(auth);
        localStorage.removeItem("admin-autenticado");
      } catch (error) {
        console.error("Error cerrando sesión al cerrar pestaña:", error);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#fdf8f4] overflow-x-hidden relative">
      <HamburgerButton
        isOpen={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      <AdminSidebar
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <main className="flex-1 min-h-screen px-4 sm:px-6 py-12 bg-[#fdf8f4] flex items-center justify-center">
        <div className="w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;





