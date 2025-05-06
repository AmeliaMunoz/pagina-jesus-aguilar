
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import React from "react";

const AdminCreateUser: React.FC = () => {
  const crearUsuarioConBono = async () => {
    const uid = crypto.randomUUID(); 

    await setDoc(doc(db, "usuarios", uid), {
      uid,
      nombre: "Laura García",
      email: "laura@example.com",
      telefono: "612345678",
      bono: {
        total: 5,
        usadas: 0,
        pendientes: 5,
      },
    });

    localStorage.setItem("uid", uid); 
    alert("Usuario creado correctamente. UID guardado en localStorage.");
    console.log("UID:", uid);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Crear nuevo usuario</h2>
      <button
        onClick={crearUsuarioConBono}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Crear usuario con bono
      </button>
    </div>
  );
};

export default AdminCreateUser;
