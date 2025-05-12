import { useState } from "react";
import { auth, createUserWithEmailAndPassword } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import AdminLayout from "../layouts/AdminLayout";
import { User } from "lucide-react";

const UserCreatePage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [totalSesiones, setTotalSesiones] = useState(5);
  const [password, setPassword] = useState("");

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
    <AdminLayout>
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
        <h2 className="text-2xl font-semibold mb-6 text-[#5f4b32] flex items-center gap-2">
          <User /> Crear nuevo usuario
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />

          <input
            type="number"
            placeholder="Número de sesiones (bono)"
            value={totalSesiones}
            onChange={(e) => setTotalSesiones(parseInt(e.target.value))}
            min={1}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />

          <button
            onClick={crearUsuario}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Crear usuario
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserCreatePage;






