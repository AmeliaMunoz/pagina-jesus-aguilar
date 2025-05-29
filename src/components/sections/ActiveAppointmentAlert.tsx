interface Props {
    onClose: () => void;
  }
  
  const ActiveAppointmentAlert = ({ onClose }: Props) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-xl border border-red-300 max-w-md w-full text-center">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Paciente ya tiene una cita</h3>
          <p className="text-sm text-gray-700 mb-6">
            Este paciente ya tiene una cita activa registrada. No puedes aprobar otra hasta que finalice o se anule.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ActiveAppointmentAlert;
  