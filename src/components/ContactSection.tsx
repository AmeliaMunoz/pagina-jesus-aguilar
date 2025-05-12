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
  query,     
  where         
} from "firebase/firestore";
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import { es } from "date-fns/locale"; // ← idioma español para el calendario
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
  
      // Combinamos si hay pocas en disponibilidad
      const horasCombinadas = horasDisponibilidad.length < 3
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
  
      // ❌ Excluir horas ya reservadas en citas (excepto las anuladas)
      const citasSnap = await getDocs(
        query(collection(db, "citas"), where("fecha", "==", fechaSeleccionada))
      );
  
      const horasOcupadas = citasSnap.docs
        .filter((doc) => doc.data().estado !== "anulada")
        .map((doc) => doc.data().hora);
  
      // 🔐 Filtrar solo horas válidas y disponibles
      const filtradas = horas.filter((hora) => {
        const [h] = hora.split(":");
        return parseInt(h) >= 7 && parseInt(h) < 22 && !horasOcupadas.includes(hora);
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

      const [h, m] = horaSeleccionada.split(":" ).map(Number);
      const fechaConHora = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        h,
        m,
        0,
        0
      );

      await addDoc(collection(db, "mensajes"), {
        nombre,
        email,
        telefono,
        mensaje,
        fechaPropuesta: Timestamp.fromDate(fechaConHora),
        horaPropuesta: horaSeleccionada,
        estado: "pendiente",
        duracionMinutos: 60,
        creado: Timestamp.now(),
      });

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
    <section id="contacto" className="bg-[#fdf8f4] py-16 px-4 sm:px-6 scroll-mt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="self-center">
          <h2 className="text-2xl md:text-3xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
            Contacto
          </h2>
          <p className="text-gray-700 mb-6 text-base sm:text-lg">
            No dudes en comunicarte para obtener más información o agendar una cita. <strong>¡Estaré encantado de ayudarte!</strong>
          </p>
          <div className="space-y-4 text-gray-700 text-base">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                <Mail />
              </span>
              <a href="mailto:jesusaguilarpsicologia@gmail.com" className="hover:underline break-all">
                jesusaguilarpsicologia@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">
                <Phone />
              </span>
              <a href="tel:+34123456789" className="hover:underline">
                +34 123 456 789
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
          <h3 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-10 font-semibold">
            Envíame un mensaje
          </h3>

          {enviado && (
            <div className="bg-[#f5ede6] text-[#5f4b32] border border-[#c8b29d] px-4 py-3 rounded-xl text-sm mb-6 font-medium shadow-sm flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              Tu mensaje ha sido enviado con éxito. Te responderé lo antes posible.
            </div>
          )}

          {error && (
            <div className="bg-[#fceeee] text-[#803e3e] border border-[#e2b8b8] px-4 py-3 rounded-xl text-sm mb-6 font-medium shadow-sm flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />
              Ha ocurrido un error. Por favor, intenta de nuevo más tarde.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="nombre" className="text-gray-700 font-medium">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-4 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-4 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="telefono" className="text-gray-700 font-medium">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-4 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium">Selecciona una fecha</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Selecciona una fecha"
                includeDates={fechasDisponibles}
                className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
                dayClassName={(date) => {
                  const yyyyMMdd = date.toLocaleDateString("sv-SE");
                  return holidays2025.includes(yyyyMMdd) ? "text-red-500" : "";
                }}
                locale={es} // ← español activado
              />
            </div>

            {horasDisponibles.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-medium">Selecciona una hora</label>
                <select
                  value={horaSeleccionada}
                  onChange={(e) => setHoraSeleccionada(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
                  required
                >
                  <option value="">Selecciona una hora</option>
                  {horasDisponibles.map((hora, index) => (
                    <option key={index} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="mensaje" className="text-gray-700 font-medium">
                Dime en qué te puedo ayudar
              </label>
              <textarea
                id="mensaje"
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 text-sm"
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