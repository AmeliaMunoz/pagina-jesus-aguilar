import { useState, useEffect } from "react";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  addDoc,
  Timestamp,
  updateDoc,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import Button from "./Button";
import { holidays2025 } from "../data/holidays";
import { CheckCircle, Mail, Phone, XCircle } from "lucide-react";

const ContactSection = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(false);
  const [fechasDisponibles, setFechasDisponibles] = useState<Date[]>([]);

  const generarFechasDisponibles = async (): Promise<Date[]> => {
    const hoy = new Date();
    const dias: Date[] = [];

    const disponibilidadSnap = await getDocs(collection(db, "disponibilidad"));
    const fechasPuntuales = disponibilidadSnap.docs.map((doc) => doc.id);

    const horariosSnap = await getDocs(collection(db, "horarios_semanales"));
    const diasRecurrentes: Record<string, string[]> = {};
    horariosSnap.docs.forEach((doc) => {
      diasRecurrentes[doc.id] = doc.data().horas || [];
    });

    for (let i = 0; i < 30; i++) {
      const fecha = addDays(hoy, i);
      const yyyyMMdd = fecha.toLocaleDateString("sv-SE");
      const diaSemana = fecha
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      const esFestivo = holidays2025.includes(yyyyMMdd);

      const tieneDisponibilidad =
        !esFestivo &&
        (fechasPuntuales.includes(yyyyMMdd) ||
          (diasRecurrentes[diaSemana] &&
            diasRecurrentes[diaSemana].some((hora) => {
              const h = parseInt(hora.split(":")[0]);
              return h >= 7 && h < 22;
            })));

      if (tieneDisponibilidad) {
        dias.push(fecha);
      }
    }

    return dias;
  };

  useEffect(() => {
    const cargarFechasDisponibles = async () => {
      const fechas = await generarFechasDisponibles();
      setFechasDisponibles(fechas);
    };
    cargarFechasDisponibles();
  }, []);

  useEffect(() => {
    const cargarHoras = async () => {
      if (!startDate) return;

      const fechaSeleccionada = startDate.toLocaleDateString("sv-SE");
      const docRef = doc(db, "disponibilidad", fechaSeleccionada);
      const docSnap = await getDoc(docRef);
      let horas: string[] = [];

      if (docSnap.exists()) {
        horas = docSnap.data().horas || [];
      } else {
        const diaSemana = startDate
          .toLocaleDateString("es-ES", { weekday: "long" })
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");
        const horarioRef = doc(db, "horarios_semanales", diaSemana);
        const horarioSnap = await getDoc(horarioRef);

        if (horarioSnap.exists()) {
          horas = horarioSnap.data().horas || [];
        }
      }

      const filtradas = horas.filter((hora) => {
        const [h] = hora.split(":");
        return parseInt(h) >= 7 && parseInt(h) < 22;
      });

      setHorasDisponibles(filtradas);
      setHoraSeleccionada("");
    };

    cargarHoras();
  }, [startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(false);
    setError(false);

    try {
      const fechaPropuesta = startDate ? startDate.toLocaleDateString("sv-SE") : null;

      const cita = {
        nombre,
        email,
        telefono,
        mensaje,
        fechaPropuesta: fechaPropuesta ? Timestamp.fromDate(new Date(fechaPropuesta)) : null,
        horaPropuesta: horaSeleccionada || null,
        estado: "aprobada",
        duracionMinutos: 60,
        creado: Timestamp.now(),
      };

      await addDoc(collection(db, "mensajes"), {
        ...cita,
        estado: "pendiente",
      });

      await addDoc(collection(db, "citas"), cita);

      if (startDate && horaSeleccionada) {
        const fecha = startDate.toLocaleDateString("sv-SE");
        const ref = doc(db, "disponibilidad", fecha);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          await updateDoc(ref, {
            horas: arrayRemove(horaSeleccionada),
          });
        } else {
          const diaSemana = startDate
            .toLocaleDateString("es-ES", { weekday: "long" })
            .toLowerCase()
            .normalize("NFD")
            .replace(/\u0300-\u036f/g, "");

          const semanaRef = doc(db, "horarios_semanales", diaSemana);
          const semanaSnap = await getDoc(semanaRef);

          if (semanaSnap.exists()) {
            await updateDoc(semanaRef, {
              horas: arrayRemove(horaSeleccionada),
            });
          }
        }
      }

      setEnviado(true);
      setNombre("");
      setEmail("");
      setTelefono("");
      setMensaje("");
      setStartDate(null);
      setHoraSeleccionada("");

      setTimeout(() => setEnviado(false), 5000);
    } catch (err) {
      console.error("Error al enviar:", err);
      setError(true);
      setTimeout(() => setError(false), 5000);
    }
  };

  return <></>; // contenido del formulario omitido para brevedad
};

export default ContactSection;

