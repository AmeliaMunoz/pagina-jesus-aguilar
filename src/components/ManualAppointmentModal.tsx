import { useState, useEffect } from "react";
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

  useEffect(() => {
    setNombre(nombreInicial);
    setEmail(emailInicial);
    setTelefono(telefonoInicial);
    setNota(notaInicial);
  }, [nombreInicial, emailInicial, telefonoInicial, notaInicial]);

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

      const [nombreSnap, emailSnap] = await Promise.all([
        getDocs(nombreQuery),
        getDocs(emailQuery),
      ]);

      const results: Paciente[] = [...nombreSnap.docs, ...emailSnap.docs].map((doc) => {
        const data = doc.data() as Omit<Paciente, "id">;
        return { id: doc.id, ...data };
      });

      const únicos = results.filter(
        (pac, index, self) =>
          index === self.findIndex((p) => p.email === pac.email)
      );

      setSearchResults(únicos);
    };

    fetchPacientes();
  }, [searchTerm]);

  const handleSelectPaciente = (paciente: Paciente) => {
    setNombre(paciente.nombre || "");
    setEmail(paciente.email || "");
    setTelefono(paciente.telefono || "");
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleGuardar = async () => {
    setLoading(true);
  
    console.log("➡️ handleGuardar ejecutado", { nombre, email, hora, fecha });
  
    if (!nombre || !email || !fecha || !hora) {
      alert("Faltan datos para guardar la cita.");
      console.log("❌ Campos incompletos:", { nombre, email, fecha, hora });
      setLoading(false);
      return;
    }
  
    const dateStr = fecha.toISOString().split("T")[0];
  
    try {
      // Buscar UID del paciente
      let uid: string | null = null;
      try {
        const usuariosSnap = await getDocs(
          query(collection(db, "usuarios"), where("email", "==", email))
        );
        if (!usuariosSnap.empty) {
          uid = usuariosSnap.docs[0].id;
        }
      } catch (e) {
        console.error("❌ Error buscando usuario:", e);
      }
  
      // Preparar objeto de cita
      const cita = {
        nombre,
        email,
        telefono,
        nota,
        fecha: dateStr,
        hora,
        estado: "aprobada",
        uid,
        creadoEl: new Date().toISOString(),
        anuladaPorUsuario: false,
        descontadaDelBono: false,
      };
  
      // Guardar cita en la colección "citas"
      try {
        await addDoc(collection(db, "citas"), cita);
        console.log("✅ Cita guardada correctamente en la colección 'citas'");
      } catch (e) {
        console.error("❌ Error guardando cita en Firebase:", e);
      }
  
      // Guardar en historial de paciente
      try {
        const pacienteRef = doc(db, "pacientes", email);
        const snap = await getDoc(pacienteRef);
        const nuevaEntrada = { fecha: dateStr, hora, estado: "aprobada", nota };
  
        if (!snap.exists()) {
          await setDoc(pacienteRef, {
            nombre,
            email,
            telefono,
            historial: [nuevaEntrada],
          });
          console.log("✅ Paciente nuevo creado con historial");
        } else {
          const data = snap.data();
          const historial = data.historial || [];
          historial.push(nuevaEntrada);
          await updateDoc(pacienteRef, { historial });
          console.log("✅ Historial actualizado para paciente existente");
        }
      } catch (e) {
        console.error("❌ Error guardando historial:", e);
      }
  
      // Finalizar
      onSave({ nombre, email, telefono });
    } catch (error) {
      console.error("❌ Error inesperado:", error);
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
            {fecha.toLocaleDateString("es-ES")} a las {hora}
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
            disabled={loading}
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

