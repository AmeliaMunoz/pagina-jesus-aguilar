interface Props {
    busqueda: string;
    setBusqueda: (value: string) => void;
  }
  
  const PatientSearchBar = ({ busqueda, setBusqueda }: Props) => (
    <input
      type="text"
      placeholder="Buscar por nombre o email"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="w-full max-w-md mx-auto block mb-10 px-4 py-2 border border-gray-300 rounded text-sm"
    />
  );
  
  export default PatientSearchBar;
  