import { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";

const CrearCitaManual = () => {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const crearCita = async () => {
    if (!uid || !email || !fecha || !hora) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await addDoc(collection(db, "citas"), {
        uid,
        email,
        fecha,
        hora,
        estado: "pendiente",
        anuladaPorUsuario: false,
        descontadaDelBono: false,
        creadoEl: Timestamp.now(),
      });

      alert("Cita creada correctamente");
      setUid("");
      setEmail("");
      setFecha("");
      setHora("");
    } catch (error) {
      console.error("Error al crear la cita:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold text-[#5f4b32] mb-6">Crear cita manual</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="UID del usuario"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="email"
          placeholder="Email del usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={crearCita}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Guardar cita
        </button>
      </div>
    </div>
  );
};

export default CrearCitaManual;
