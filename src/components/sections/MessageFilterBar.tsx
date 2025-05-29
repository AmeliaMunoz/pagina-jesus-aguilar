interface Props {
    filtroEstado: string;
    setFiltroEstado: (estado: string) => void;
  }
  
  const MessageFilterBar = ({ filtroEstado, setFiltroEstado }: Props) => {
    const estados = ["pendiente", "rechazada", "aprobada", "todos"];
  
    return (
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {estados.map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filtroEstado === estado
                ? "bg-[#b89b71] text-white"
                : "bg-white border border-[#c8b29d] text-[#5f4b32]"
            }`}
          >
            {estado === "todos"
              ? "Todos"
              : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>
    );
  };
  
  export default MessageFilterBar;
  