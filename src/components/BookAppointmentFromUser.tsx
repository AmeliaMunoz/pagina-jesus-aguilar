import { JSX, useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
registerLocale("es", es);
import emailjs from "@emailjs/browser";


const sendConfirmationEmail = async ({
  nombre,
  email,
  fecha,
  hora,
}: {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
}) => {
  try {
    await emailjs.send(
      "service_0u8915d",
      "template_plgpe5m",
      { nombre, email, fecha, hora },
      "7tsLKu2YpfAADoYYx"
    );
    console.log("📧 Email de confirmación enviado (usuario)");
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
  }
};


import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { holidays2025 } from "../data/holidays";
import { CalendarClock } from "lucide-react";
import { checkAppointmentExists } from "../utils/checkAppointmentExists";

interface Props {
  uid: string;
  userEmail: string;
  userName: string;
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
  onBooked,
}: Props): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchAvailableDates = async () => {
      const result: Date[] = [];
  
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = formatDate(date);
  
        const dayOfWeek = date
          .toLocaleDateString("es-ES", { weekday: "long" })
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
  
        if (holidays2025.includes(dateStr) || date.getDay() === 6) continue;
  
        let horasDisponibles: string[] = [];
  
        // 1. Obtener disponibilidad puntual
        const disponibilidadSnap = await getDoc(doc(db, "disponibilidad", dateStr));
        const horasEnDoc = disponibilidadSnap.exists()
          ? disponibilidadSnap.data().horas || []
          : [];
  
        // 2. Si hay pocas, combinar con horarios semanales
        if (horasEnDoc.length < 3) {
          const horarioSnap = await getDoc(doc(db, "horarios_semanales", dayOfWeek));
          const horasSemana = horarioSnap.exists() ? horarioSnap.data().horas || [] : [];
  
          horasDisponibles = Array.from(new Set([...horasEnDoc, ...horasSemana]));
        } else {
          horasDisponibles = horasEnDoc;
        }
  
        // 3. Bloquear mensajes pendientes
        const mensajesSnap = await getDocs(
          query(
            collection(db, "mensajes"),
            where(
              "fechaPropuesta",
              "==",
              Timestamp.fromDate(
                new Date(date.getFullYear(), date.getMonth(), date.getDate())
              )
            ),
            where("estado", "==", "pendiente")
          )
        );
  
        const horasBloqueadasPorMensajes = mensajesSnap.docs.map(
          (doc) => doc.data().horaPropuesta
        );
  
        // 4. Bloquear citas activas (sin rechazar ni anular)
        const citasSnap = await getDocs(
          query(collection(db, "citas"), where("fecha", "==", dateStr))
        );
  
        const horasBloqueadasPorCitas = citasSnap.docs
          .filter((doc) =>
            ["aprobada", "ausente", "pendiente"].includes(doc.data().estado)
          )
          .map((doc) => doc.data().hora);
  
        // 5. Aplicar filtros
        const horasFinales = horasDisponibles.filter(
          (h) =>
            !horasBloqueadasPorMensajes.includes(h) &&
            !horasBloqueadasPorCitas.includes(h)
        );
  
        console.log("🗓️", dateStr, "→", horasFinales);
  
        if (horasFinales.length > 0) {
          result.push(new Date(date));
        }
      }
  
      console.log("📆 Días disponibles:", result);
      setAvailableDates(result);
    };
  
    fetchAvailableDates();
  }, []);
  

  useEffect(() => {
    const fetchAvailableHours = async () => {
      if (!selectedDate) return;
  
      const dateStr = formatDate(selectedDate);
      const dayOfWeek = selectedDate
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
  
      let horasDisponibles: string[] = [];
  
      // 1. Obtener disponibilidad directa
      const disponibilidadSnap = await getDoc(doc(db, "disponibilidad", dateStr));
      const horasEnDoc = disponibilidadSnap.exists() ? disponibilidadSnap.data().horas || [] : [];
  
      // 2. Si hay pocas, combinar con horarios semanales
      if (horasEnDoc.length < 3) {
        const horarioSnap = await getDoc(doc(db, "horarios_semanales", dayOfWeek));
        const horasSemana = horarioSnap.exists() ? horarioSnap.data().horas || [] : [];
  
        horasDisponibles = Array.from(new Set([...horasEnDoc, ...horasSemana]));
  
        // 3. Bloquear por mensajes pendientes
        const mensajesSnap = await getDocs(
          query(
            collection(db, "mensajes"),
            where(
              "fechaPropuesta",
              "==",
              Timestamp.fromDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                )
              )
            ),
            where("estado", "==", "pendiente")
          )
        );
  
        const horasBloqueadasPorMensajes = mensajesSnap.docs.map(
          (doc) => doc.data().horaPropuesta
        );
  
        horasDisponibles = horasDisponibles.filter(
          (hora) => !horasBloqueadasPorMensajes.includes(hora)
        );
      } else {
        horasDisponibles = horasEnDoc;
      }
  
      // 4. Obtener citas y filtrar solo las activas
      const citasSnap = await getDocs(
        query(collection(db, "citas"), where("fecha", "==", dateStr))
      );
  
      // 🔍 Log para verificar qué se recibe
      console.log("📂 Citas obtenidas para", dateStr, "→", citasSnap.docs.map((doc) => doc.data()));
  
      const horasBloqueadasPorCitas = citasSnap.docs
        .filter((doc) =>
          ["aprobada", "ausente", "pendiente"].includes(doc.data().estado)
        )
        .map((doc) => doc.data().hora);
  
      console.log("⛔ Horas bloqueadas por citas:", horasBloqueadasPorCitas);
  
      // 5. Filtrar final
      const filtradas = horasDisponibles.filter((hora) => !horasBloqueadasPorCitas.includes(hora));
  
      console.log("✅ Horas finales disponibles:", filtradas);
      setAvailableHours(filtradas);
    };
  
    fetchAvailableHours();
  }, [selectedDate, refreshKey]);
  
  const handleBooking = async () => {
    if (!selectedDate || !selectedHour) return;
    setLoading(true);

    const dateStr = formatDate(selectedDate);
    const yaExiste = await checkAppointmentExists(userEmail, dateStr, selectedHour);
    if (yaExiste) {
      setErrorMensaje("❗ Ya tienes una cita registrada en esa fecha y hora.");
      setLoading(false);
      return;
    }

    try {
      const cita = {
        uid,
        email: userEmail,
        nombre: userName,
        fecha: dateStr,
        hora: selectedHour,
        estado: "aprobada",
        anuladaPorUsuario: false,
        creadoEl: new Date().toISOString(),
      };

      await addDoc(collection(db, "citas"), cita);
      await sendConfirmationEmail({
        nombre: userName,
        email: userEmail,
        fecha: dateStr,
        hora: selectedHour,
      });
      

      const disponibilidadRef = doc(db, "disponibilidad", dateStr);
      const disponibilidadSnap = await getDoc(disponibilidadRef);
      const data = disponibilidadSnap.data();
      const horasActualizadas = (data?.horas || []).filter((h: string) => h !== selectedHour);
      await setDoc(disponibilidadRef, { horas: horasActualizadas, fecha: dateStr });

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

      setLoading(false);
      setSuccess(true);
      setRefreshKey((prev) => prev + 1);
      setErrorMensaje("");
      onBooked();
    } catch (error) {
      console.error("Error al reservar cita:", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-[#e0d6ca] w-full">
      <h2 className="text-2xl font-bold text-[#5f4b32] mb-6 text-center">
        Reservar nueva cita
      </h2>
      {errorMensaje && (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
        {errorMensaje}
      </div>
        )}
      {success ? (
        <p className="text-green-600 font-medium text-center">
          Cita reservada correctamente.
        </p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* FECHAS */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 text-[#5f4b32]">
              1. Elige una fecha disponible
            </h3>
  
            <div className="block lg:hidden">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedHour("");
                }}
                filterDate={(date) => date.getDay() !== 6}
                includeDates={availableDates}
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
                filterDate={(date) => date.getDay() !== 6}
                includeDates={availableDates}
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
  
          {/* HORAS + RESUMEN + BOTÓN */}
          <div className="w-full flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#5f4b32]">
                2. Selecciona una hora
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableHours.length > 0 ? (
                  availableHours.map((hora) => (
                    <button
                      key={hora}
                      onClick={() => setSelectedHour(hora)}
                      className={`px-3 py-2 rounded border text-sm transition ${
                        selectedHour === hora
                          ? "bg-[#836a48] text-white"
                          : "bg-white text-[#5f4b32] border-[#e0d6ca] hover:bg-[#f9f6f1]"
                      }`}
                    >
                      {hora}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Selecciona una fecha para ver las horas.
                  </p>
                )}
              </div>
            </div>
  
            {selectedDate && selectedHour && (
              <div className="bg-[#f9f6f1] border border-[#e0d6ca] rounded-lg p-4 text-sm text-[#5f4b32] shadow-sm mb-4 flex items-start gap-3 mt-6">
                <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6 text-[#5f4b32]" />
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
              className="bg-[#836a48] mt-2 w-full text-white py-3 rounded font-medium hover:bg-[#a38862] disabled:opacity-50 transition"
            >
              {loading ? "Reservando..." : "Confirmar cita"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}  

export default BookAppointmentFromUser;




