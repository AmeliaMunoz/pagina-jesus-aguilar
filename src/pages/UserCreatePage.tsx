import { useState } from "react";
import { auth, createUserWithEmailAndPassword } from "../firebase";  // Asegúrate de importar auth y createUserWithEmailAndPassword
import { db } from "../firebase"; // Firebase Firestore
import { doc, setDoc } from "firebase/firestore";
import { User } from "lucide-react";

const UserCreatePage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [totalSesiones, setTotalSesiones] = useState(5);
  const [password, setPassword] = useState("");  // Añadimos campo de contraseña

  const crearUsuario = async () => {
    if (!nombre || !email || !telefono || !password) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;  // Obtenemos el uid del usuario recién creado

      // Crear documento de usuario en Firestore
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
      
      // Limpiar los campos
      setNombre("");
      setEmail("");
      setTelefono("");
      setPassword("");  // Limpiar el campo de la contraseña
      setTotalSesiones(5);

    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Hubo un error al crear el usuario.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-[#5f4b32]">Crear nuevo usuario</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="password"  // Cambié el tipo de este campo a "password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Número de sesiones (bono)"
          value={totalSesiones}
          onChange={(e) => setTotalSesiones(parseInt(e.target.value))}
          min={1}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={crearUsuario}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Crear usuario
        </button>
      </div>
    </div>
  );
};

export default UserCreatePage;

