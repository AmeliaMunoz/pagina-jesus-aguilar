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
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col justify-center items-center px-4">
      {/* Logo */}
      <div className="w-32 h-32 3xl:w-40 3xl:h-40 mb-6">
        <IconoLogo className="w-full h-full" />
      </div>

      {/* Formulario */}
      <div className="w-full max-w-sm 3xl:max-w-4xl bg-white p-8 3xl:p-20 rounded-lg shadow-lg border border-[#e0d6ca]">
        <h1 className="text-3xl 3xl:text-5xl font-semibold text-center text-[#5f4b32] mb-8">
          Acceso Administrador
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm 3xl:text-base font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 3xl:py-3 border border-gray-300 rounded-lg text-sm 3xl:text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b89b71]"
              placeholder="admin@tucentro.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm 3xl:text-base font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 3xl:py-3 border border-gray-300 rounded-lg text-sm 3xl:text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b89b71]"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 3xl:py-4 bg-[#b89b71] text-white text-lg 3xl:text-xl font-semibold rounded-lg hover:bg-[#9e855c] transition"
          >
            Iniciar sesión
          </button>

          {error && (
            <p className="text-red-600 text-sm 3xl:text-base text-center mt-2">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;


