// src/components/ManualAppointmentModal.tsx
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
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

      const q = query(
        collection(db, "usuarios"),
        where("nombre", ">=", searchTerm),
        where("nombre", "<=", searchTerm + "\uf8ff")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSearchResults(results);
    };

    fetchPacientes();
  }, [searchTerm]);

  const handleSelectPaciente = (paciente: any) => {
    setNombre(paciente.nombre || "");
    setEmail(paciente.email || "");
    setTelefono(paciente.telefono || "");
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleGuardar = async () => {
    setLoading(true);
    const dateStr = fecha.toISOString().split("T")[0];

    if (modoEdicion && soloEditarPaciente) {
      onSave({ nombre, email, telefono });
      setLoading(false);
      return;
    }

    await addDoc(collection(db, "citas"), {
      nombre,
      email,
      telefono,
      nota,
      fecha: dateStr,
      hora,
      estado: "aprobada",
      uid: null,
      creadoEl: new Date().toISOString(),
      anuladaPorUsuario: false,
      descontadaDelBono: false,
    });

    const ref = doc(db, "pacientes", email);
    const snap = await getDoc(ref);
    const nuevaEntrada = { fecha: dateStr, hora, estado: "aprobada", nota };

    if (!snap.exists()) {
      await setDoc(ref, {
        nombre,
        email,
        telefono,
        historial: [nuevaEntrada],
      });
    } else {
      const data = snap.data();
      const historial = data.historial || [];
      historial.push(nuevaEntrada);
      await updateDoc(ref, { historial });
    }

    setLoading(false);
    onSave({ nombre, email, telefono });
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
              placeholder="Buscar paciente por nombre..."
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













