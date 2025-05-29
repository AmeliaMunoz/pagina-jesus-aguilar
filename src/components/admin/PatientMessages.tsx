interface Props {
    mensajeExito: string;
    mensajeError: string;
  }
  
  const PatientMessages = ({ mensajeExito, mensajeError }: Props) => (
    <>
      {mensajeExito && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-6 text-sm text-center">
          {mensajeExito}
        </div>
      )}
  
      {mensajeError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-6 text-sm text-center">
          {mensajeError}
        </div>
      )}
    </>
  );
  
  export default PatientMessages;
  