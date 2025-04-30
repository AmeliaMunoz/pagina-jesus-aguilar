import { useState, useEffect } from "react";
import { db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { guardarCitaEnHistorial } from "../utils/patients";
import { CalendarDays } from "lucide-react";

interface CitaHistorial {
  fecha: string;
  hora: string;
  estado: string;
  nota?: string;
}

type DatosPaciente = {
  nombre: string;
  email: string;
  telefono: string;
  nota?: string;
};

type ModalSaveData = CitaHistorial | DatosPaciente;

interface ModalProps {
  fecha: Date;
  hora: string;
  onClose: () => void;
  onSave: (data: ModalSaveData) => void;
  nombre?: string;
  email?: string;
  telefono?: string;
  nota?: string;
  modoEdicion?: boolean;
  soloEditarPaciente?: boolean;
}

const ManualAppointmentModal = ({
  fecha,
  hora,
  onClose,
  onSave,
  nombre: nombreInicial = "",
  email: emailInicial = "",
  telefono: telefonoInicial = "",
  nota: notaInicial = "",
  modoEdicion = false,
  soloEditarPaciente = false,
}: ModalProps) => {
  const [nombre, setNombre] = useState(nombreInicial);
  const [email, setEmail] = useState(emailInicial);
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [nota, setNota] = useState(notaInicial);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setNombre(nombreInicial);
    setEmail(emailInicial);
    setTelefono(telefonoInicial);
    setNota(notaInicial);
  }, [nombreInicial, emailInicial, telefonoInicial, notaInicial]);

  const handleGuardar = async () => {
    setEnviando(true);
    try {
      if (modoEdicion) {
        if (soloEditarPaciente) {
          onSave({ nombre, email, telefono, nota });
        } else {
          const cita: CitaHistorial = {
            fecha: fecha.toISOString().split("T")[0],
            hora,
            estado: "aprobada",
            nota,
          };
          onSave(cita);
        }
      } else {
        await addDoc(collection(db, "mensajes"), {
          nombre,
          email,
          telefono,
          mensaje: nota,
          fechaPropuesta: Timestamp.fromDate(fecha),
          horaPropuesta: hora,
          estado: "aprobada",
          duracionMinutos: 60,
          creado: Timestamp.now(),
        });

        await guardarCitaEnHistorial(email, nombre, telefono || "Desconocido", {
          fecha: fecha.toISOString().split("T")[0],
          hora,
          estado: "aprobada",
          nota: nota || "Cita manual desde admin",
        });

        onClose();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {soloEditarPaciente ? "Editar paciente" : modoEdicion ? "Editar cita" : "Nueva cita manual"}
        </h3>

        {!soloEditarPaciente && (
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <CalendarDays />
            {fecha.toLocaleDateString("es-ES")} a las {hora}
         </p>
        
        )}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
          />
          <textarea
            placeholder="Nota (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
            rows={3}
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={enviando}
            className="px-4 py-2 rounded bg-[#b89b71] text-white hover:bg-[#9e855c] text-sm w-full sm:w-auto"
          >
            {enviando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAppointmentModal;





