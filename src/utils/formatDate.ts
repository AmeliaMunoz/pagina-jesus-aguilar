import { Timestamp } from "firebase/firestore";

/**
 * Formatea una fecha en formato "dd/mm/aaaa"
 * Acepta string "aaaa-mm-dd", Date o Firebase Timestamp
 */
export function formatearFecha(fecha: string | Date | Timestamp): string {
  let dateObj: Date;

  if (typeof fecha === "string") {
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  if (fecha instanceof Timestamp) {
    dateObj = fecha.toDate();
  } else {
    dateObj = fecha;
  }

  return dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

  