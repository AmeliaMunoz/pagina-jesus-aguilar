import { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  id: string;
  fecha: Date;
  hora: string;
  nombre: string;
  email: string;
  telefono: string;
  nota?: string;
  mensajeDelPaciente?: string;
  onClose: () => void;
  onUpdate: () => void;
  onDeleteFromHistory: () => Promise<void>;
}

const liberarHoraEnDisponibilidad = async (fecha: string, hora: string) => {
  const ref = doc(db, "disponibilidad", fecha);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, { horas: arrayUnion(hora) });
  } else {
    await setDoc(ref, { horas: [hora] });
  }
};

const EditAppointmentModal = ({
  id,
  fecha,
  hora,
  nota,
  mensajeDelPaciente,
  email,
  onClose,
  onUpdate,
  onDeleteFromHistory,
}: Props) => {
  const [nuevaFecha, setNuevaFecha] = useState<Date>(fecha);
  const [nuevaHora, setNuevaHora] = useState(hora);
  const [nuevaNota, setNuevaNota] = useState(nota || "");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await liberarHoraEnDisponibilidad(
        fecha.toISOString().split("T")[0],
        hora
      );

      await updateDoc(doc(db, "citas", id), {
        fecha: nuevaFecha.toISOString().split("T")[0],
        hora: nuevaHora,
        nota: nuevaNota,
      });

      onUpdate();
      onClose();
    } catch (err) {
      console.error("❌ Error al guardar cambios:", err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await deleteDoc(doc(db, "citas", id));
      await onDeleteFromHistory();
      onUpdate();
      onClose();
    } catch (err) {
      console.error("❌ Error al eliminar cita:", err);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Editar cita</h3>

        <label className="block text-sm font-medium text-gray-700">Fecha</label>
        <DatePicker
          selected={nuevaFecha}
          onChange={(date) => setNuevaFecha(date!)}
          className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
          dateFormat="yyyy-MM-dd"
        />

        <label className="block text-sm font-medium text-gray-700">Hora</label>
        <input
          type="time"
          value={nuevaHora}
          onChange={(e) => setNuevaHora(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
        />

        <label className="block text-sm font-medium text-gray-700">Nota (solo visible por el profesional)</label>
        <textarea
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
          rows={3}
        />

        {mensajeDelPaciente && (
          <div className="mt-4 p-4 bg-[#fdf8f4] border border-[#e0d6ca] rounded">
            <p className="text-sm text-[#5f4b32] font-medium mb-2">Mensaje del paciente:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensajeDelPaciente}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded text-sm">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={handleEliminar} disabled={eliminando} className="bg-red-600 text-white px-4 py-2 rounded text-sm">
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;










