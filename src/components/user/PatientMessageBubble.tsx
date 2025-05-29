import { Timestamp } from "firebase/firestore";

interface Props {
  texto: string;
  fecha: Timestamp | string;
  enviadoPorPaciente: boolean;
}

const PatientMessageBubble = ({ texto, fecha, enviadoPorPaciente }: Props) => {
  const fechaFormateada =
    fecha instanceof Timestamp
      ? fecha.toDate().toLocaleString("es-ES")
      : new Date(fecha).toLocaleString("es-ES");

  return (
    <div
      className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
        enviadoPorPaciente
          ? "bg-blue-100 text-blue-800 self-end text-right"
          : "bg-green-100 text-green-800 self-start text-left"
      }`}
    >
      <p>{texto}</p>
      <p className="text-xs text-gray-500 mt-1">{fechaFormateada}</p>
    </div>
  );
};

export default PatientMessageBubble;
