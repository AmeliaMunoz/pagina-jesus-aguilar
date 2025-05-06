import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import IconoLogo from "../components/IconoLogo"; // Asegúrate de que el logo esté bien importado

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Para manejar errores
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación del formato del correo
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    try {
      // Intentamos iniciar sesión con las credenciales
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");  // Redirigir a la página de perfil si el login es exitoso
    } catch (err: any) {
      setError("Error: " + err.message); // Mostrar el error si la autenticación falla
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col justify-center items-center">
      {/* Logo */}
      <div className="w-32 h-32 mb-6">
        <IconoLogo className="w-full h-full" /> {/* Reemplaza con el logo de tu app */}
      </div>

      {/* Formulario de login */}
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-[#5f4b32] mb-8">Iniciar sesión</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Campo de correo */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b89b71]"
              placeholder="correo@dominio.com"
            />
          </div>

          {/* Campo de contraseña */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b89b71]"
              placeholder="********"
            />
          </div>

          {/* Botón de inicio de sesión */}
          <button
            type="submit"
            className="w-full py-2 bg-[#5f4b32] text-white text-lg font-semibold rounded-lg hover:bg-[#b89b71] focus:outline-none"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Mostrar errores */}
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

        {/* Otros enlaces */}
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-sm text-[#5f4b32] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


