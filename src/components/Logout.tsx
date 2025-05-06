import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Logout = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada correctamente");
      // Redirige al paciente a la página de inicio o de login
    } catch (err: any) {
      console.error("Error al cerrar sesión: ", err);
    }
  };

  return (
    <button onClick={handleLogout}>Cerrar sesión</button>
  );
};

export default Logout;
