import { CalendarDays, Activity, FileText } from "lucide-react";
import { formatearFecha } from "../../utils/formatDate";

interface CitaHistorial {
  fecha: string;
  hora: string;
  estado: string;
  nota?: string;
}

interface Props {
  historial: CitaHistorial[];
  email: string;
  notaEditandoSesion: { email: string; index: number } | null;
  setNotaEditandoSesion: (data: { email: string; index: number } | null) => void;
  notaSesion: string;
  setNotaSesion: (nota: string) => void;
  guardarNotaSesion: (email: string, index: number, nota: string) => void;
}

const PatientSessionHistory = ({
  historial,
  email,
  notaEditandoSesion,
  setNotaEditandoSesion,
  notaSesion,
  setNotaSesion,
  guardarNotaSesion,
}: Props) => (
  <div>
    <p className="font-medium text-[#5f4b32] mb-1">Historial de sesiones:</p>
    {historial.length > 0 ? (
      <ul className="space-y-2">
        {historial.map((cita, index) => (
          <li key={index} className="bg-white p-3 border border-[#e0d6ca] rounded">
            <p className="text-sm flex items-center gap-2">
              <CalendarDays size={14} className="text-[#5f4b32]" />
              {formatearFecha(cita.fecha)} a las {cita.hora}
            </p>
            <p className="text-sm flex items-center gap-2">
              <Activity size={14} className="text-green-700" /> Estado: {cita.estado}
            </p>
            <div className="flex justify-between items-start">
              {notaEditandoSesion?.email === email && notaEditandoSesion.index === index ? (
                <div className="w-full space-y-2">
                  <textarea
                    className="w-full border border-gray-300 rounded p-2"
                    rows={2}
                    value={notaSesion}
                    onChange={(e) => setNotaSesion(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarNotaSesion(email, index, notaSesion)}
                      className="text-sm px-4 py-1 bg-[#5f4b32] text-white rounded"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setNotaEditandoSesion(null)}
                      className="text-sm px-4 py-1 bg-gray-300 text-gray-800 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center w-full">
                  {cita.nota ? (
                    <p className="text-sm italic flex items-center gap-2">
                      <FileText size={14} className="text-[#b89b71]" /> {cita.nota}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Sin nota</p>
                  )}
                  <button
                    onClick={() => {
                      setNotaEditandoSesion({ email, index });
                      setNotaSesion(cita.nota || "");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Editar nota
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">Este paciente no tiene citas aún.</p>
    )}
  </div>
);

export default PatientSessionHistory;
