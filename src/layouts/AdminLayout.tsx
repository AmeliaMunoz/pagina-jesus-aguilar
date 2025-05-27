import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import HamburgerButton from "../components/HamburgerButton";
import AdminHeader from "../components/AdminHeader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin-login");
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#fdf8f4] overflow-hidden">
     
      <AdminSidebar
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

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
