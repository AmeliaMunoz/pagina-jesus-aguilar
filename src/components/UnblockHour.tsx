// En el panel de administración, desbloquear la hora al rechazar una cita

import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const desbloquearHora = async (fecha: string, hora: string) => {
  const disponibilidadRef = doc(db, "disponibilidad", fecha);
  const disponibilidadSnap = await getDoc(disponibilidadRef);

  if (disponibilidadSnap.exists()) {
    await updateDoc(disponibilidadRef, {
      horas: arrayUnion(hora),
    });
  } else {
    const diaSemana = new Date(fecha)
      .toLocaleDateString("es-ES", { weekday: "long" })
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    const horarioRef = doc(db, "horarios_semanales", diaSemana);
    const horarioSnap = await getDoc(horarioRef);
    if (horarioSnap.exists()) {
      await updateDoc(horarioRef, {
        horas: arrayUnion(hora),
      });
    }
  }
};

export default desbloquearHora;
