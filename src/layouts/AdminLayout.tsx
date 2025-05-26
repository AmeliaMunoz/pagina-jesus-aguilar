import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import HamburgerButton from "../components/HamburgerButton";
import { auth, signOut } from "../firebase";
import AdminHeader from "../components/AdminHeader";

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

  // Cierre de sesión automático al cerrar pestaña o recargar
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
    <div className="flex h-screen bg-[#fdf8f4] overflow-hidden">
      {/* Sidebar fijo */}
      <AdminSidebar
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Contenido del admin */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <HamburgerButton
          isOpen={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
        />
        <AdminHeader />

        <main className="flex-1 py-12 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 3xl:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
