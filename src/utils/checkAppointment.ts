import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const checkAppointment = async (email: string): Promise<boolean> => {
  const emailNormalizado = email.trim().toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, "citas"),
    where("email", "==", emailNormalizado),
    where("estado", "in", ["pendiente", "aprobada", "ausente"])
  );

  const citasSnap = await getDocs(q);

  return citasSnap.docs.some((doc) => {
    const data = doc.data();
    const fecha = data.fecha;
    return typeof fecha === "string" && fecha >= todayStr;
  });
};
