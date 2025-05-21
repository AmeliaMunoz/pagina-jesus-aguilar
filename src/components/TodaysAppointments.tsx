
import { useEffect, useState } from "react";
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Cita {
  id: string;
  nombre: string;
  email: string;
  horaPropuesta: string;
  estado: string;
}

const TodaysAppointments = () => {
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);

  useEffect(() => {
    const hoy = new Date();
    const fechaHoyStr = format(hoy, "yyyy-MM-dd");

    const q = query(
      collection(db, "mensajes"),
      where("fechaFormateada", "==", fechaHoyStr),
      where("estado", "in", ["aprobada", "ausente"])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const citas = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          email: data.email,
          horaPropuesta: data.horaPropuesta,
          estado: data.estado,
        };
      });

      // Ordenar por hora ascendente
      const ordenadas = citas.sort((a, b) => a.horaPropuesta.localeCompare(b.horaPropuesta));
      setCitasHoy(ordenadas);
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-[#e8d4c3]">
      <h2 className="text-xl font-semibold mb-4">
        Citas para hoy, {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })}
        </h2>

      {citasHoy.length === 0 ? (
        <p className="text-gray-600 text-sm">No hay citas programadas para hoy.</p>
      ) : (
        <ul className="space-y-3">
          {citasHoy.map((cita) => (
            <li
              key={cita.id}
              className="flex items-center justify-between border-b border-gray-200 pb-2"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={18} />
                <span className="font-medium">{cita.horaPropuesta}</span> —
                <span>{cita.nombre}</span> (<span className="text-sm">{cita.email}</span>)
              </div>

              {cita.estado === "aprobada" ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-yellow-600" size={20} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodaysAppointments;

