import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const checkExactAppointmentExists = async (
  email: string,
  fecha: string,
) => {
  const q = query(
    collection(db, "citas"),
    where("email", "==", email),
    where("estado", "in", ["aprobada", "pendiente", "ausente"])
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return data.fecha === fecha;
  });
};
