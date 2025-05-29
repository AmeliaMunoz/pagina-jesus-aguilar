interface Props {
    nombre: string;
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  const ConfirmDeleteModal = ({ nombre, onConfirm, onCancel }: Props) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl border border-[#e0d6ca] max-w-md w-full text-center">
        <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">Confirmar eliminación</h3>
        <p className="text-sm text-gray-700 mb-6">
          ¿Estás seguro de que quieres eliminar a <strong>{nombre}</strong> y todas sus citas? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            Eliminar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
  
  export default ConfirmDeleteModal;
  