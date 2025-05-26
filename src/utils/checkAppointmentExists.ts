
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const checkAppointmentExists = async (email: string): Promise<boolean> => {
  const citasSnap = await getDocs(collection(db, "citas"));
  const emailNormalizado = email.trim().toLowerCase();

  return citasSnap.docs.some((doc) => {
    const data = doc.data();
    return (
      data.email?.trim().toLowerCase() === emailNormalizado &&
      ["pendiente", "aprobada", "ausente"].includes(data.estado)
    );
  });
};



