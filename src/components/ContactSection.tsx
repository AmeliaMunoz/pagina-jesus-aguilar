import { useState, useEffect } from "react";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  addDoc,
  Timestamp,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import { es } from "date-fns/locale";
import Button from "./Button";
import { holidays2025 } from "../data/holidays";
import { AlertTriangle, CheckCircle, Mail, Phone } from "lucide-react";

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
    const disponibilidadMap: Record<string, string[]> = {};
    disponibilidadSnap.docs.forEach((docSnap) => {
      disponibilidadMap[docSnap.id] = docSnap.data().horas || [];
    });

    const horariosSnap = await getDocs(collection(db, "horarios_semanales"));
    const horariosMap: Record<string, string[]> = {};
    horariosSnap.docs.forEach((doc) => {
      horariosMap[doc.id] = doc.data().horas || [];
    });

    for (let i = 0; i < 30; i++) {
      const fecha = addDays(hoy, i);
      const yyyyMMdd = fecha.toLocaleDateString("sv-SE");
      const diaSemana = fecha
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      if (holidays2025.includes(yyyyMMdd)) continue;

      const horasDisponibilidad = disponibilidadMap[yyyyMMdd] || [];
      const horasSemana = horariosMap[diaSemana] || [];

      const horasCombinadas =
        horasDisponibilidad.length < 3
          ? Array.from(new Set([...horasDisponibilidad, ...horasSemana]))
          : horasDisponibilidad;

      const horasValidas = horasCombinadas.filter((hora) => {
        const h = parseInt(hora.split(":")[0]);
        return h >= 7 && h < 22;
      });

      if (horasValidas.length > 0) {
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
      const diaSemana = startDate
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      let horas: string[] = [];

      const docRef = doc(db, "disponibilidad", fechaSeleccionada);
      const docSnap = await getDoc(docRef);
      const horasDisponibilidad = docSnap.exists() ? docSnap.data().horas || [] : [];

      if (horasDisponibilidad.length < 3) {
        const horarioRef = doc(db, "horarios_semanales", diaSemana);
        const horarioSnap = await getDoc(horarioRef);
        const horasSemana = horarioSnap.exists() ? horarioSnap.data().horas || [] : [];

        horas = Array.from(new Set([...horasDisponibilidad, ...horasSemana]));
      } else {
        horas = horasDisponibilidad;
      }

      const citasSnap = await getDocs(collection(db, "citas"));
      const horasOcupadas = citasSnap.docs
        .map((doc) => doc.data())
        .filter((cita) => {
          let fechaCita = "";

          if (typeof cita.fecha === "string") {
            fechaCita = cita.fecha;
          } else if (cita.fecha?.toDate) {
            fechaCita = cita.fecha.toDate().toISOString().split("T")[0];
          }

    return (
      fechaCita === fechaSeleccionada &&
      ["aprobada", "ausente", "pendiente"].includes(cita.estado)
    );
  })
  .map((cita) => cita.hora);


      const filtradas = horas.filter((hora) => {
        const [h] = hora.split(":");
        return (
          parseInt(h) >= 7 &&
          parseInt(h) < 22 &&
          !horasOcupadas.includes(hora)
        );
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
      if (!startDate || !horaSeleccionada) {
        setError(true);
        return;
      }

      const [h, m] = horaSeleccionada.split(":").map(Number);
      const fechaConHora = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        h,
        m
      );

      const fechaStr = startDate.toLocaleDateString("sv-SE");
      const emailNormalizado = email.trim().toLowerCase();

      await addDoc(collection(db, "mensajes"), {
        nombre,
        email: emailNormalizado,
        telefono,
        mensaje,
        fechaPropuesta: Timestamp.fromDate(fechaConHora),
        horaPropuesta: horaSeleccionada,
        estado: "pendiente",
        duracionMinutos: 60,
        creado: Timestamp.now(),
      });

      await addDoc(collection(db, "citas"), {
        nombre,
        email: emailNormalizado,
        telefono,
        mensajeDelPaciente: mensaje,
        fecha: fechaStr,
        hora: horaSeleccionada,
        estado: "pendiente",
        duracionMinutos: 60,
        creadoEl: new Date().toISOString(),
      });

      const ref = doc(db, "disponibilidad", fechaStr);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          horas: arrayRemove(horaSeleccionada),
        });
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

  return (
    <section id="contacto" className="bg-[#fdf8f4] py-16 px-4 sm:px-6 2xl:px-20 3xl:px-32 scroll-mt-24">
    <div className="max-w-6xl 3xl:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      
      {/* Columna izquierda */}
      <div className="self-center">
        <h2 className="text-2xl md:text-3xl 3xl:text-4xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
          Contacto
        </h2>
        <p className="text-gray-700 mb-6 text-base sm:text-lg 3xl:text-xl">
          No dudes en comunicarte para obtener más información o agendar una cita. <strong>¡Estaré encantado de ayudarte!</strong>
        </p>
        <div className="space-y-4 text-gray-700 text-base 3xl:text-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl"><Mail /></span>
            <a href="mailto:jesusaguilarpsicologia@gmail.com" className="hover:underline break-all">
              jesusaguilarpsicologia@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl"><Phone /></span>
            <a href="tel:+34123456789" className="hover:underline">
              +34 123 456 789
            </a>
          </div>
        </div>
      </div>
  
      {/* Columna derecha - formulario */}
      <div className="bg-white p-6 sm:p-8 3xl:p-10 rounded-xl shadow-md">
        <h3 className="text-xl md:text-2xl 3xl:text-3xl text-gray-700 tracking-widest uppercase mb-10 font-semibold">
          Envíame un mensaje
        </h3>
  
        {/* mensajes de éxito o error se quedan igual */}
       
        {enviado && (
          <div className="flex items-center gap-3 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md mb-4">
            <span className="text-xl"><CheckCircle /></span>
            <p className="text-sm 3xl:text-base">
              ¡Tu mensaje ha sido enviado con éxito! Pronto recibirás una respuesta.
            </p>
          </div>
        )}
        {error && (
        <div className="flex items-center gap-3 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md mb-4">
          <span className="text-xl"><AlertTriangle /></span>
          <p className="text-sm 3xl:text-base">
            Ups... algo salió mal. Revisa los campos o inténtalo de nuevo más tarde.
          </p>
        </div>
      )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre" className="text-gray-700 font-medium 3xl:text-lg">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="border border-gray-300 rounded px-4 py-2 text-sm 3xl:text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-gray-700 font-medium 3xl:text-lg">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 rounded px-4 py-2 text-sm 3xl:text-base"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="telefono" className="text-gray-700 font-medium 3xl:text-lg">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                className="border border-gray-300 rounded px-4 py-2 text-sm 3xl:text-base"
              />
            </div>
          </div>
  
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium 3xl:text-lg">Selecciona una fecha</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Selecciona una fecha"
              includeDates={fechasDisponibles}
              className="w-full border border-gray-300 px-4 py-2 rounded text-sm 3xl:text-base"
              locale={es}
            />
          </div>
  
          {horasDisponibles.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium 3xl:text-lg">Selecciona una hora</label>
              <select
                value={horaSeleccionada}
                onChange={(e) => setHoraSeleccionada(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded text-sm 3xl:text-base"
                required
              >
                <option value="">Selecciona una hora</option>
                {horasDisponibles.map((hora, index) => (
                  <option key={index} value={hora}>{hora}</option>
                ))}
              </select>
            </div>
          )}
  
          <div className="flex flex-col gap-2">
            <label htmlFor="mensaje" className="text-gray-700 font-medium 3xl:text-lg">Dime en qué te puedo ayudar</label>
            <textarea
              id="mensaje"
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm 3xl:text-base"
            />
          </div>
  
          <div className="pt-2">
            <Button type="submit">Enviar</Button>
          </div>
        </form>
      </div>
    </div>
  </section>  
  );
};

export default ContactSection;
