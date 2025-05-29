import { useState } from "react";
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

interface Props {
  redirectTo: string;
  authKey: string;
  title: string;
}

const Login = ({ redirectTo, authKey, title }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      await setPersistence(auth, browserSessionPersistence); 
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem(authKey, "true");
      navigate(redirectTo);
    } catch (err: any) {
      setError("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm 3xl:max-w-md bg-white p-8 3xl:p-12 rounded-lg shadow-lg">
        <h1 className="text-3xl 3xl:text-4xl font-semibold text-center text-[#5f4b32] mb-8">
          {title}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm 3xl:text-base">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-[#b89b71] text-white py-2 rounded hover:bg-[#9e855c] transition"
          >
            Iniciar sesión
          </button>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
