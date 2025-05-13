import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CalendarDays } from "lucide-react";

interface Props {
  fecha: Date;
  hora: string;
  onClose: () => void;
  onSave: (data: { nombre: string; email: string; telefono: string }) => void;
  nombre?: string;
  email?: string;
  telefono?: string;
  nota?: string;
  modoEdicion?: boolean;
  soloEditarPaciente?: boolean;
}

interface Paciente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
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
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Paciente[]>([]);
  const [nombre, setNombre] = useState(nombreInicial);
  const [email, setEmail] = useState(emailInicial);
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [nota, setNota] = useState(notaInicial);
  const [loading, setLoading] = useState(false);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState(hora);

  useEffect(() => {
    setNombre(nombreInicial);
    setEmail(emailInicial);
    setTelefono(telefonoInicial);
    setNota(notaInicial);
    setSelectedHour(hora);
  }, [nombreInicial, emailInicial, telefonoInicial, notaInicial, hora]);

  useEffect(() => {
    const fetchPacientes = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }
  
      const nombreQuery = query(
        collection(db, "usuarios"),
        where("nombre", ">=", searchTerm),
        where("nombre", "<=", searchTerm + "\uf8ff")
      );
  
      const emailQuery = query(
        collection(db, "usuarios"),
        where("email", ">=", searchTerm),
        where("email", "<=", searchTerm + "\uf8ff")
      );
  
      const pacientesQuery = query(
        collection(db, "pacientes")
      );
  
      const [nombreSnap, emailSnap, pacientesSnap] = await Promise.all([
        getDocs(nombreQuery),
        getDocs(emailQuery),
        getDocs(pacientesQuery),
      ]);
  
      const resultsUsuarios: Paciente[] = [...nombreSnap.docs, ...emailSnap.docs].map((doc) => {
        const data = doc.data() as Omit<Paciente, "id">;
        return { id: doc.id, ...data };
      });
  
      const resultsPacientes: Paciente[] = pacientesSnap.docs
        .map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            nombre: data.nombre || "",
            email: data.email || "",
            telefono: data.telefono || "",
          };
        })
        .filter((p) =>
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
  
      const combinados = [...resultsUsuarios, ...resultsPacientes];
  
      const únicos = combinados.filter(
        (pac, index, self) =>
          index === self.findIndex((p) => p.email === pac.email)
      );
  
      setSearchResults(únicos);
    };
  
    fetchPacientes();
  }, [searchTerm]);
  

  useEffect(() => {
    const fetchAvailableHours = async () => {
      const dateStr = fecha.toISOString().split("T")[0];
      const dayOfWeek = fecha
        .toLocaleDateString("es-ES", { weekday: "long" })
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
  
      let horasDisponibles: string[] = [];
  
      const disponibilidadSnap = await getDoc(doc(db, "disponibilidad", dateStr));
      const tieneDocumento = disponibilidadSnap.exists();
      const horasEnDoc = tieneDocumento ? disponibilidadSnap.data().horas || [] : [];
  
      // Si hay menos de 3 horas en disponibilidad, completa con horario semanal
      if (horasEnDoc.length < 3) {
        const horarioSnap = await getDoc(doc(db, "horarios_semanales", dayOfWeek));
        const horasSemana = horarioSnap.exists() ? horarioSnap.data().horas || [] : [];
  
        horasDisponibles = Array.from(new Set([...horasEnDoc, ...horasSemana]));
      } else {
        horasDisponibles = horasEnDoc;
      }
  
      // Eliminar horas ocupadas por otras citas
      const citasSnap = await getDocs(
        query(collection(db, "citas"))
      );
  
      const ocupadas = citasSnap.docs
        .map((doc) => doc.data())
        .filter((cita) => cita.fecha === dateStr && ["aprobada", "ausente"].includes(cita.estado))
        .map((cita) => cita.hora?.trim())
        .filter((hora): hora is string => !!hora);
  
      const disponiblesFinal = horasDisponibles.filter((h) => !ocupadas.includes(h));
      setAvailableHours(disponiblesFinal);
  
      // Si la hora seleccionada ya no está disponible, limpiala
      if (!disponiblesFinal.includes(selectedHour)) {
        setSelectedHour("");
      }
    };
  
    fetchAvailableHours();
  }, [fecha]);

  const handleSelectPaciente = (paciente: Paciente) => {
    setNombre(paciente.nombre || "");
    setEmail(paciente.email || "");
    setTelefono(paciente.telefono || "");
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleGuardar = async () => {
    setLoading(true);

    if (!nombre || !email || !fecha || !selectedHour) {
      alert("Faltan datos para guardar la cita.");
      setLoading(false);
      return;
    }

    const dateStr = fecha.toLocaleDateString("sv-SE"); // yyyy-MM-dd

    try {
      let uid: string | null = null;
      const usuariosSnap = await getDocs(
        query(collection(db, "usuarios"), where("email", "==", email))
      );
      if (!usuariosSnap.empty) {
        uid = usuariosSnap.docs[0].id;
      }

      const cita = {
        nombre,
        email,
        telefono,
        nota,
        fecha: dateStr,
        hora: selectedHour,
        estado: "aprobada",
        uid,
        creadoEl: new Date().toISOString(),
        anuladaPorUsuario: false,
        descontadaDelBono: false,
      };

      await addDoc(collection(db, "citas"), cita);

      const disponibilidadRef = doc(db, "disponibilidad", dateStr);
      const snap = await getDoc(disponibilidadRef);
      const data = snap.data();
      const horasActualizadas = (data?.horas || []).filter((h: string) => h !== selectedHour);

      await setDoc(disponibilidadRef, {
        horas: horasActualizadas,
        fecha: dateStr,
      });

      const pacienteRef = doc(db, "pacientes", email);
      const pacienteSnap = await getDoc(pacienteRef);
      const nuevaEntrada = { fecha: dateStr, hora: selectedHour, estado: "aprobada", nota };

      if (!pacienteSnap.exists()) {
        await setDoc(pacienteRef, {
          nombre,
          email,
          telefono,
          historial: [nuevaEntrada],
        });
      } else {
        const data = pacienteSnap.data();
        const historial = data.historial || [];
        historial.push(nuevaEntrada);
        await updateDoc(pacienteRef, { historial });
      }

      onSave({ nombre, email, telefono });
    } catch (error) {
      console.error(" Error inesperado:", error);
      alert("Ha ocurrido un error al guardar la cita.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {soloEditarPaciente ? "Editar paciente" : "Nueva cita manual"}
        </h3>

        {!soloEditarPaciente && (
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <CalendarDays />
            {fecha.toLocaleDateString("es-ES")} a las {selectedHour}
          </p>
        )}

        {!soloEditarPaciente && (
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente por nombre o email..."
              className="w-full border px-4 py-2 rounded text-sm"
            />
            {searchResults.length > 0 && (
              <ul className="bg-white border rounded mt-1 max-h-40 overflow-y-auto text-sm">
                {searchResults.map((paciente) => (
                  <li
                    key={paciente.id}
                    onClick={() => handleSelectPaciente(paciente)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {paciente.nombre} — {paciente.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!soloEditarPaciente && (
          <div className="mb-4 space-y-2">
            <label className="text-sm font-medium text-[#5f4b32]">Selecciona hora disponible:</label>
            <div className="flex flex-wrap gap-2">
              {availableHours.length > 0 ? (
                availableHours.map((h) => (
                  <button
                    key={h}
                    onClick={() => setSelectedHour(h)}
                    className={`px-3 py-1 rounded border text-sm transition ${
                      selectedHour === h
                        ? "bg-[#5f4b32] text-white"
                        : "bg-white text-[#5f4b32] border-[#e0d6ca] hover:bg-[#f9f6f1]"
                    }`}
                  >
                    {h}
                  </button>
                ))
              ) : (
                <p className="text-sm text-red-500">No hay horas disponibles.</p>
              )}
            </div>
          </div>
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
            disabled={loading || !selectedHour}
            className="px-4 py-2 rounded bg-[#b89b71] text-white hover:bg-[#9e855c] text-sm w-full sm:w-auto"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAppointmentModal;
