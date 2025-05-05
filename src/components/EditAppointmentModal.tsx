import { useState} from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  onClose: () => void;
  onUpdate: () => void;
  onDeleteFromHistory: () => void;
}

const EditAppointmentModal = ({
  id,
  fecha,
  hora,
  nota,
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
      await updateDoc(doc(db, "mensajes", id), {
        fechaPropuesta: nuevaFecha,
        horaPropuesta: nuevaHora,
        mensaje: nuevaNota,
      });
      onUpdate();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await deleteDoc(doc(db, "mensajes", id));
      await onDeleteFromHistory();
      onUpdate();
    } catch (err) {
      console.error("Error al eliminar cita:", err);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Editar cita</h3>
        <div className="space-y-2">
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

          <label className="block text-sm font-medium text-gray-700">Nota</label>
          <textarea
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
          >
            Cancelar
          </button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="w-full px-4 py-2 rounded bg-[#b89b71] text-white hover:bg-[#9e855c] text-sm"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="w-full px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;



