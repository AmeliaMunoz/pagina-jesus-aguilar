import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

interface LogoutProps {
  redirectTo: string;
  authKey: string;
  className?: string;
}

const Logout= ({ redirectTo, authKey, className }: LogoutProps) => {
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
    <button onClick={handleLogout} className={className || "text-sm text-white hover:text-red-300"}>
      Cerrar sesión
    </button>
  );
};

export default Logout;

