
interface Props {
    mostrarConfirmacion: { uid: string; nombre: string };
    onConfirm: () => Promise<void>;
    onCancel: () => void;
  }
  
  const DeleteConfirmationModal = ({
    mostrarConfirmacion,
    onConfirm,
    onCancel,
  }: Props) => {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white border border-[#e0d6ca] rounded-xl p-6 w-full max-w-sm text-center shadow-xl">
          <h3 className="text-lg font-semibold text-[#5f4b32] mb-2">Eliminar conversación</h3>
          <p className="text-sm text-gray-700 mb-6">
            ¿Estás seguro de que deseas eliminar todos los mensajes de{" "}
            <strong>{mostrarConfirmacion.nombre}</strong>?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default DeleteConfirmationModal;
  