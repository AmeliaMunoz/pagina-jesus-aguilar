
import { useState } from "react";

interface Props {
  onSend: (texto: string) => void;
}

const AppointmentMessageForm = ({ onSend }: Props) => {
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = () => {
    if (!mensaje.trim()) return;
    onSend(mensaje);
    setMensaje("");
    setEnviado(true);
  };

  return (
    <div className="pt-6">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        ¿Quieres compartir algo antes de la sesión?
      </label>
      <textarea
        className="w-full border border-[#e0d6ca] rounded p-3 text-sm"
        rows={3}
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Por ejemplo: me gustaría hablar sobre lo que pasó el fin de semana..."
      />
      <button
        onClick={handleSubmit}
        className="mt-3 px-4 py-2 bg-[#5f4b32] text-white rounded hover:bg-[#b89b71]"
      >
        Enviar mensaje
      </button>
      {enviado && (
        <p className="text-green-600 text-sm mt-2">
          Mensaje enviado correctamente.
        </p>
      )}
    </div>
  );
};

export default AppointmentMessageForm;
