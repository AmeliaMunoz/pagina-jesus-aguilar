interface Props {
    email: string;
    notaGeneral: string;
    editandoNota: string | null;
    setEditandoNota: (email: string | null) => void;
    nuevaNota: string;
    setNuevaNota: (nota: string) => void;
    guardarNota: (email: string, nota: string) => void;
  }
  
  const PatientNote = ({
    email,
    notaGeneral,
    editandoNota,
    setEditandoNota,
    nuevaNota,
    setNuevaNota,
    guardarNota,
  }: Props) => (
    <div>
      <p className="font-medium text-[#5f4b32] mb-1">Nota general:</p>
      {editandoNota === email ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            rows={3}
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => guardarNota(email, nuevaNota)}
              className="text-sm px-4 py-2 rounded bg-[#5f4b32] text-white hover:bg-[#9e855c]"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditandoNota(null)}
              className="text-sm px-4 py-2 rounded bg-gray-200 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-gray-700 italic">{notaGeneral || "Sin nota general"}</p>
          <button
            onClick={() => {
              setEditandoNota(email);
              setNuevaNota(notaGeneral || "");
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Editar nota
          </button>
        </div>
      )}
    </div>
  );
  
  export default PatientNote;
  