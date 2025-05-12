import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import IconoLogo from "../components/IconoLogo";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      const data = userDoc.data();

      if (data?.rol === "admin") {
        localStorage.setItem("admin-autenticado", "true");
        navigate("/admin");
      } else {
        setError("No tienes permisos de administrador.");
        await signOut(auth);
      }
    } catch (err: any) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col justify-center items-center">
      <div className="w-32 h-32 mb-6">
        <IconoLogo className="w-full h-full" />
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-[#5f4b32] mb-8">
          Acceso Administrador
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b89b71]"
              placeholder="admin@tucentro.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b89b71]"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#5f4b32] text-white text-lg font-semibold rounded-lg hover:bg-[#b89b71]"
          >
            Iniciar sesión
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLoginPage;

