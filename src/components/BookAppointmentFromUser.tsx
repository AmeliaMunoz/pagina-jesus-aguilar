import { JSX, useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
registerLocale("es", es);

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { holidays2025 } from "../data/holidays";
import { CalendarClock } from "lucide-react";

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
}: Props): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const isDateAvailable = (date: Date) =>
    availableDates.some((d) => formatDate(d) === formatDate(date));

  useEffect(() => {
    const fetchAvailableDates = async () => {
      const result: Date[] = [];

      try {
        for (let i = 1; i <= 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const dateStr = formatDate(date);

          const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "long" })
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          if (holidays2025.includes(dateStr)) continue;

          const disponibilidadSnap = await getDocs(
            query(collection(db, "disponibilidad"), where("fecha", "==", dateStr))
          );
          if (!disponibilidadSnap.empty) {
            result.push(new Date(date));
            continue;
          }

          const dayDoc = await getDoc(doc(db, "horarios_semanales", dayOfWeek));
          if (dayDoc.exists()) result.push(new Date(date));
        }

        setAvailableDates(result);
      } catch (err) {
        console.error(" Error cargando fechas:", err);
      }
    };

    fetchAvailableDates();
  }, []);

  useEffect(() => {
    const fetchAvailableHours = async () => {
      if (!selectedDate) return;

      const dateStr = formatDate(selectedDate);
      const dayOfWeek = selectedDate
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase();

      let horasDisponibles: string[] = [];

      const disponibilidadSnap = await getDocs(
        query(collection(db, "disponibilidad"), where("fecha", "==", dateStr))
      );
      if (!disponibilidadSnap.empty) {
        horasDisponibles = HOURS;
      } else {
        const docSnap = await getDoc(doc(db, "horarios_semanales", dayOfWeek));
        if (docSnap.exists()) {
          const data = docSnap.data();
          horasDisponibles = data.horas || [];
        }
      }

      const citasSnap = await getDocs(
        query(collection(db, "citas"), where("fecha", "==", dateStr))
      );
      const usadas = citasSnap.docs.map(doc => {
        const data = doc.data();
        return data.hora || data.horaPropuesta;
      });

      const disponibles = horasDisponibles.filter(hora => !usadas.includes(hora));
      setAvailableHours(disponibles);
    };

    fetchAvailableHours();
  }, [selectedDate]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedHour) return;
    setLoading(true);
  
    const [day, month, year] = selectedDate
      .toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" })
      .split("/");
    const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  
    try {
      const cita = {
        uid,
        email: userEmail,
        nombre: userName,
        fecha: dateStr,
        hora: selectedHour,
        estado: "aprobada", 
        anuladaPorUsuario: false,
        descontadaDelBono: false,
        creadoEl: new Date().toISOString(),
      };
  
      // 1. Guardar en colección citas
      await addDoc(collection(db, "citas"), cita);
  
      // 2. Actualizar bono
      await updateDoc(doc(db, "usuarios", uid), {
        "bono.pendientes": bonoPendiente - 1,
        ...(bonoPendiente === 1 && { "bono.usadas": 1 }),
      });
  
      // 3. Actualizar historial del paciente
      const pacienteRef = doc(db, "pacientes", userEmail);
      const pacienteSnap = await getDoc(pacienteRef);
      const nuevaEntrada = {
        fecha: dateStr,
        hora: selectedHour,
        estado: "aprobada",
        nota: "",
      };
  
      if (!pacienteSnap.exists()) {
        await setDoc(pacienteRef, {
          nombre: userName,
          email: userEmail,
          historial: [nuevaEntrada],
        });
      } else {
        const data = pacienteSnap.data();
        const historial = data.historial || [];
        historial.push(nuevaEntrada);
        await updateDoc(pacienteRef, { historial });
      }
  
      // 4. Resetear estado
      setSelectedDate(null);
      setSelectedHour("");
      setAvailableHours([]);
      setSuccess(true);
      onBooked();
    } catch (error) {
      console.error("Error al reservar cita:", error);
      alert("Ocurrió un error al reservar la cita.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-[#e0d6ca] max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-[#5f4b32] mb-6 text-center">Reservar nueva cita</h2>

      {success ? (
        <p className="text-green-600 font-medium text-center">Cita reservada correctamente.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          {/* Calendario */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 text-[#5f4b32]">1. Elige una fecha disponible</h3>

            <div className="block lg:hidden">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedHour("");
                }}
                filterDate={isDateAvailable}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                locale="es"
                placeholderText="Selecciona una fecha"
                className="w-full border p-3 rounded text-sm"
              />
            </div>

            <div className="hidden lg:block w-full max-w-[340px]">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedHour("");
                }}
                filterDate={isDateAvailable}
                minDate={new Date()}
                inline
                dateFormat="dd/MM/yyyy"
                locale="es"
              />
            </div>

            {availableDates.length === 0 && (
              <p className="text-sm text-red-500 mt-4">
                No hay fechas disponibles actualmente. Intenta más tarde.
              </p>
            )}
          </div>

          {/* Selector de hora y resumen */}
          <div className="w-full flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#5f4b32]">2. Selecciona una hora</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableHours.length > 0 ? (
                  availableHours.map((hora) => (
                    <button
                      key={hora}
                      onClick={() => setSelectedHour(hora)}
                      className={`px-3 py-2 rounded border text-sm transition ${
                        selectedHour === hora
                          ? "bg-[#5f4b32] text-white"
                          : "bg-white text-[#5f4b32] border-[#e0d6ca] hover:bg-[#f9f6f1]"
                      }`}
                    >
                      {hora}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Selecciona una fecha para ver las horas.</p>
                )}
              </div>
            </div>

            {selectedDate && selectedHour && (
              <div className="bg-[#f9f6f1] border border-[#e0d6ca] rounded-lg p-4 text-sm text-[#5f4b32] shadow-sm mb-4 flex items-start gap-3 mt-6">
                <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-10 lg:h-10 text-[#5f4b32]" />
                <div>
                  <h4 className="font-semibold mb-2">Resumen de la cita:</h4>
                  <p>
                    <span className="font-medium">Fecha:</span>{" "}
                    {selectedDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Hora:</span> {selectedHour}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={loading || !selectedDate || !selectedHour}
              className="bg-[#5f4b32] mt-2 w-full text-white py-3 rounded font-medium hover:bg-[#b89b71] disabled:opacity-50 transition"
            >
              {loading ? "Reservando..." : "Confirmar cita"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointmentFromUser;






















