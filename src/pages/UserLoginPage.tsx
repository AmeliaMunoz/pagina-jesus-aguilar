import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import IconoLogo from "../components/IconoLogo";

const UserLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
  
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
  
      // Verificar rol y estado del usuario
      const userDoc = await getDoc(doc(db, "usuarios", uid));
      const data = userDoc.data();
  
      if (!data) {
        setError("Usuario no encontrado.");
        return;
      }
  
      if (data.rol === "admin") {
        setError("Este usuario es administrador. Usa el acceso para admin.");
        return;
      }
  
      if (data.activo === false) {
        setError("Tu cuenta ha sido desactivada. Contacta con el administrador.");
        return;
      }
  
      localStorage.setItem("user-autenticado", "true");
      navigate("/panel/paciente/user");
    } catch (err: any) {
      setError("Correo o contraseña incorrectos.");
    }
  };
  

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col justify-center items-center px-4">
      {/* Logo */}
      <div className="w-32 h-32 mb-6">
        <IconoLogo className="w-full h-full" />
      </div>

      {/* Formulario */}
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg border border-[#e0d6ca]">
        <h1 className="text-3xl font-semibold text-center text-[#5f4b32] mb-8">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#b89b71] focus:outline-none"
              placeholder="correo@dominio.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#b89b71] focus:outline-none"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#b89b71] text-white text-lg font-semibold rounded-lg hover:bg-[#9e855c] transition"
          >
            Iniciar sesión
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center mt-2">{error}</p>
          )}
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-[#5f4b32] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
