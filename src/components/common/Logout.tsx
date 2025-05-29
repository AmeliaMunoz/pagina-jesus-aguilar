import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

interface LogoutProps {
  redirectTo: string;
  authKey: string;
  className?: string;
}

const Logout = ({ redirectTo, authKey, className }: LogoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(authKey);
      navigate(redirectTo);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "flex items-center gap-2 px-4 py-2 bg-[#b89b71] text-white rounded hover:bg-[#9e855c] text-sm 3xl:text-base transition"
      }
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </button>
  );
};

export default Logout;


