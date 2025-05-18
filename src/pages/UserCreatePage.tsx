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
  const [password, setPassword] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const crearUsuario = async () => {
    if (!nombre || !email || !telefono || !password) {
      setMensajeError("Todos los campos son obligatorios.");
      setTimeout(() => setMensajeError(""), 4000);
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
      });

      await setDoc(doc(db, "pacientes", email), {
        nombre,
        email,
        telefono,
        historial: [],
      });

      setMensajeExito("✅ Usuario y paciente creados correctamente.");
      setTimeout(() => setMensajeExito(""), 4000);

      // Resetear formulario
      setNombre("");
      setEmail("");
      setTelefono("");
      setPassword("");
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      if (error.code === "auth/email-already-in-use") {
        setMensajeError("❗ Ya existe un usuario con ese correo.");
      } else {
        setMensajeError("❌ Hubo un error al crear el usuario.");
      }
      setTimeout(() => setMensajeError(""), 4000);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-[#5f4b32] flex items-center gap-2">
            <User className="w-6 h-6" /> Crear nuevo usuario
          </h2>

          {mensajeExito && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-4 text-sm text-center">
              {mensajeExito}
            </div>
          )}

          {mensajeError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
              {mensajeError}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
            />

            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
            />

            <button
              onClick={crearUsuario}
              className="w-full bg-[#b89b71] text-white py-3 rounded hover:bg-[#9e855c] text-sm font-medium"
            >
              Crear usuario
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserCreatePage;










