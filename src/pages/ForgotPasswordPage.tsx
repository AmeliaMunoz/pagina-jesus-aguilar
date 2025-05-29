import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import IconoLogo from "../components/common/IconoLogo";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Te hemos enviado un enlace para restablecer tu contraseña.");
    } catch (err: any) {
      setError("No se pudo enviar el correo. Verifica que el email sea correcto.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4] px-4">
      <div className="bg-white w-full max-w-md 3xl:max-w-lg p-8 3xl:p-14 rounded-2xl shadow-md border border-[#e0d6ca]">
        <div className="w-28 h-28 3xl:w-36 3xl:h-36 mx-auto mb-6">
          <IconoLogo className="w-full h-full" />
        </div>

        <h1 className="text-2xl 3xl:text-3xl font-semibold mb-4 text-center text-[#5f4b32]">
          ¿Has olvidado tu contraseña?
        </h1>
        <p className="text-sm 3xl:text-base text-gray-600 mb-6 text-center">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#b89b71] text-sm 3xl:text-base"
          />

          <button
            type="submit"
            className="w-full bg-[#b89b71] text-white py-2 rounded hover:bg-[#9e855c] text-base 3xl:text-lg"
          >
            Enviar enlace
          </button>
        </form>

        {message && <p className="text-green-600 text-sm 3xl:text-base mt-4">{message}</p>}
        {error && <p className="text-red-600 text-sm 3xl:text-base mt-4">{error}</p>}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm 3xl:text-base text-[#5f4b32] hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

