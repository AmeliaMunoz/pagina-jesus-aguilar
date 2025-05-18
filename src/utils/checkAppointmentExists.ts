import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const checkAppointmentExists = async (
  email: string,
  fecha: string,
  hora: string
): Promise<boolean> => {
  const citasSnap = await getDocs(collection(db, "citas"));

  for (const doc of citasSnap.docs) {
    const d = doc.data();
    const coincide =
      d.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
      d.fecha === fecha &&
      d.hora === hora &&
      ["aprobada", "ausente"].includes(d.estado);

    if (coincide) {
      console.log("🧪 Coincidencia encontrada:", d); 
    
      return true;
    }
  }

  return false;
};


