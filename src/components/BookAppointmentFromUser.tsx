import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { holidays2025 } from "../data/holidays";

interface Props {
  uid: string;
  userEmail: string;
  userName: string;
  bonoPendiente: number;
  onBooked: () => void;
}

const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00"
];

const BookAppointmentFromUser = ({
  uid,
  userEmail,
  userName,
  bonoPendiente,
  onBooked,
}: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      const today = new Date();
      const result: Date[] = [];

      // Comprobar los próximos 30 días
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const dayString = date.toISOString().split("T")[0];

        // Comprobar si es un festivo
        if (holidays2025.includes(dayString)) continue;

        // Consultamos en la colección "disponibilidad"
        const disponibilidadSnap = await getDocs(
          query(collection(db, "disponibilidad"), where("fecha", "==", dayString))
        );

        // Si hay disponibilidad en ese día, lo agregamos
        if (!disponibilidadSnap.empty) {
          result.push(new Date(date));
        } else {
          // Consultamos en "horarios_semanales" si hay horarios disponibles para ese día
          const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase();

          const horariosSnap = await getDocs(
            query(collection(db, "horarios_semanales"), where("dia", "==", dayOfWeek))
          );

          // Si hay horarios para ese día, lo agregamos
          if (!horariosSnap.empty) {
            result.push(new Date(date));
          }
        }
      }

      // Establecer las fechas disponibles
      setAvailableDates(result);
    };

    fetchAvailableDates();
  }, []);

  useEffect(() => {
    const fetchAvailableHours = async () => {
      if (!selectedDate) return;

      const dateString = selectedDate.toISOString().split("T")[0];

      // Consultamos si ya hay citas en ese día
      const usedHoursSnap = await getDocs(
        query(collection(db, "citas"), where("fecha", "==", dateString))
      );

      const usedHours = usedHoursSnap.docs.map((doc) => doc.data().hora);

      // Filtramos las horas disponibles
      setAvailableHours(HOURS.filter((hora) => !usedHours.includes(hora)));
    };

    fetchAvailableHours();
  }, [selectedDate]);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (available) => available.toDateString() === date.toDateString()
    );
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedHour) return;
    setLoading(true);

    const dateString = selectedDate.toISOString().split("T")[0];

    // Guardamos la cita en Firestore
    await addDoc(collection(db, "citas"), {
      uid,
      email: userEmail,
      nombre: userName,
      fecha: dateString,
      hora: selectedHour,
      estado: "pendiente",
      anuladaPorUsuario: false,
      descontadaDelBono: false,
      creadoEl: new Date().toISOString(),
    });

    // Actualizamos el bono del usuario
    const userRef = doc(db, "usuarios", uid);
    await updateDoc(userRef, {
      "bono.pendientes": bonoPendiente - 1,
      "bono.usadas": bonoPendiente === 1 ? 1 : undefined,
    });

    setLoading(false);
    setSuccess(true);
    onBooked();
  };

  return (
    <div className="bg-[#fdf8f4] border p-4 rounded mt-6">
      <h2 className="text-lg font-semibold text-[#5f4b32] mb-4">Reservar nueva cita</h2>

      {success ? (
        <p className="text-green-700">Cita reservada correctamente </p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm mb-1">Selecciona una fecha:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedHour(""); // Limpiar la hora cuando se cambia la fecha
              }}
              filterDate={isDateAvailable} // Solo mostrar fechas disponibles
              minDate={new Date()} // No permitir fechas pasadas
              placeholderText="Haz clic para elegir un día disponible"
              className="w-full border p-2 rounded"
              dateFormat="dd/MM/yyyy"
              locale="es"
            />
          </div>

          {selectedDate && (
            <div className="mb-4">
              <label className="block text-sm mb-1">Hora:</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Selecciona una hora</option>
                {availableHours.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={loading || !selectedDate || !selectedHour}
            className="bg-[#5f4b32] text-white px-4 py-2 rounded hover:bg-[#b89b71] disabled:opacity-50"
          >
            {loading ? "Reservando..." : "Confirmar cita"}
          </button>
        </>
      )}
    </div>
  );
};

export default BookAppointmentFromUser;




