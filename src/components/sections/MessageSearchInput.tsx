interface Props {
    busqueda: string;
    setBusqueda: (valor: string) => void;
  }
  
  const MessageSearchInput = ({ busqueda, setBusqueda }: Props) => {
    return (
      <div className="mb-8 text-center">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded text-sm"
        />
      </div>
    );
  };
  
  export default MessageSearchInput;
  