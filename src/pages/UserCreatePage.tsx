import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { auth, createUserWithEmailAndPassword } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import AdminSidebar from "../components/AdminSidebar";
import HamburgerButton from "../components/HamburgerButton";
import { User } from "lucide-react";

const UserCreatePage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [totalSesiones, setTotalSesiones] = useState(5);
  const [password, setPassword] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarVisible(false);
  }, [location.pathname]);

  const crearUsuario = async () => {
    if (!nombre || !email || !telefono || !password) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "usuarios", uid), {
        uid,
        nombre,
        email,
        telefono,
        bono: {
          total: totalSesiones,
          usadas: 0,
          pendientes: totalSesiones,
        },
      });

      alert("Usuario creado correctamente.");
      setNombre("");
      setEmail("");
      setTelefono("");
      setPassword("");
      setTotalSesiones(5);

    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Hubo un error al crear el usuario.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fdf8f4] overflow-x-hidden relative">
      <HamburgerButton
        isOpen={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      <AdminSidebar
        isOpen={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <main className="w-full px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl p-6 bg-white shadow rounded-xl">
          <h2 className="text-2xl font-semibold mb-6 text-[#5f4b32] flex items-center gap-2">
            <User /> Crear nuevo usuario
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <input
              type="number"
              placeholder="Número de sesiones (bono)"
              value={totalSesiones}
              onChange={(e) => setTotalSesiones(parseInt(e.target.value))}
              min={1}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <button
              onClick={crearUsuario}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Crear usuario
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserCreatePage;





