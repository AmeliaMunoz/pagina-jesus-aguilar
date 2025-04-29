import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface CitaHistorial {
  fecha: string;    // formato YYYY-MM-DD
  hora: string;     // formato HH:mm
  estado: string;   // ejemplo: "aprobada", "rechazada", "pendiente"
  nota?: string;    // opcional
}

export const guardarCitaEnHistorial = async (
  email: string,
  nombre: string,
  telefono: string,
  cita: CitaHistorial
) => {
  const ref = doc(db, "pacientes", email);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Paciente ya existe → actualizamos historial
    await updateDoc(ref, {
      historial: arrayUnion(cita)
    });
  } else {
    // Paciente nuevo → creamos documento
    await setDoc(ref, {
      nombre,
      email,
      telefono,
      creado: serverTimestamp(),
      historial: [cita]
    });
  }
};
