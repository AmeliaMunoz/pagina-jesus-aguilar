import { useState } from "react";
import {
  CalendarCheck2,
  MessageSquareText,
  History,
  XCircle,
} from "lucide-react";
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface Props {
  proximaCita: {
    id: string;
    fecha: string;
    hora: string;
  } | null;
}

const UserStatusCard = ({ proximaCita }: Props) => {
  const [anulando, setAnulando] = useState(false);
  const [anulada, setAnulada] = useState(false);

  const handleAnularCita = async () => {
    if (!proximaCita) return;
    const { id, fecha, hora } = proximaCita;
    setAnulando(true);

    try {
      const ref = doc(db, "citas", id);
      const snap = await getDoc(ref);
      const data = snap.data();
      const fueForzada = data?.forzada === true;

      // ✅ Solo liberar si no fue forzada
      if (!fueForzada) {
        const disponibilidadRef = doc(db, "disponibilidad", fecha);
        const disponibilidadSnap = await getDoc(disponibilidadRef);

        if (disponibilidadSnap.exists()) {
          await updateDoc(disponibilidadRef, {
            horas: arrayUnion(hora),
          });
        } else {
          await setDoc(disponibilidadRef, {
            fecha,
            horas: [hora],
          });
        }
      }

      // ❌ Eliminar cita
      await deleteDoc(ref);
      setAnulada(true);
    } catch (err) {
      console.error("❌ Error al anular cita:", err);
    } finally {
      setAnulando(false);
    }
  };

  return (
    <div className="bg-white border-l-4 border-[#b89b71] border-opacity-30 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[#5f4b32] flex items-center gap-2">
        <CalendarCheck2 className="w-6 h-6 text-[#5f4b32]" />
        Tu situación actual
      </h2>

      <ul className="text-sm text-[#5f4b32] space-y-4">
        <li className="flex items-start gap-2">
          <CalendarCheck2 className="w-5 h-5 mt-0.5 text-green-700" />
          <span>
            Próxima cita:{" "}
            {proximaCita && !anulada
              ? `${new Date(proximaCita.fecha).toLocaleDateString("es-ES")} a las ${proximaCita.hora}`
              : "No tienes ninguna cita pendiente"}
          </span>
        </li>

        <li className="flex items-start gap-2">
          <MessageSquareText className="w-5 h-5 mt-0.5 text-yellow-700" />
          <span>Puedes enviar un mensaje privado en cualquier momento.</span>
        </li>

        <li className="flex items-start gap-2">
          <History className="w-5 h-5 mt-0.5 text-blue-700" />
          <span>Consulta tu historial de sesiones anteriores.</span>
        </li>
      </ul>

      {proximaCita && !anulada && (
        <div className="pt-4">
          <button
            onClick={handleAnularCita}
            disabled={anulando}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition"
          >
            <XCircle className="w-4 h-4" />
            {anulando ? "Anulando cita..." : "Anular cita"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserStatusCard;
