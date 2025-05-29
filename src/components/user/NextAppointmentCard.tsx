
interface Props {
    cita: {
      fecha: string;
      hora: string;
      estado: string;
    };
    onCancelar: () => void;
  }
  
  const NextAppointmentCard = ({ cita, onCancelar }: Props) => {
    const fechaLocal = new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  
    return (
      <div className="text-sm text-[#5f4b32] space-y-2">
        <p>
          <strong>Fecha:</strong> {fechaLocal} a las {cita.hora}
        </p>
        <p>
          <strong>Estado:</strong> {cita.estado}
        </p>
  
        <button
          onClick={onCancelar}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
        >
          Anular cita
        </button>
      </div>
    );
  };
  
  export default NextAppointmentCard;
  