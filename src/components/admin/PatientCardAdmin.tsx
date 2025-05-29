
import {
    Mail,
    Phone,
    CalendarDays,
    FileText,
    Pencil,
    Trash2,
    Activity,
    ChevronDown,
    ChevronUp,
  } from "lucide-react";
  import { formatearFecha } from "../../utils/formatDate";
  
  interface CitaHistorial {
    fecha: string;
    hora: string;
    estado: string;
    nota?: string;
  }
  
  interface Paciente {
    nombre: string;
    email: string;
    telefono: string;
    historial: CitaHistorial[];
    notaGeneral?: string;
  }
  
  interface Props {
    paciente: Paciente;
    pacienteExpandido: string | null;
    setPacienteExpandido: React.Dispatch<React.SetStateAction<string | null>>;
    setPacienteEditando: (p: Paciente) => void;
    setPacienteAEliminar: (p: Paciente) => void;
    editandoNota: string | null;
    setEditandoNota: (email: string | null) => void;
    nuevaNota: string;
    setNuevaNota: (nota: string) => void;
    guardarNotaGeneral: (email: string, nota: string) => Promise<void>;
    notaEditandoSesion: { email: string; index: number } | null;
    setNotaEditandoSesion: (value: { email: string; index: number } | null) => void;
    notaSesion: string;
    setNotaSesion: (nota: string) => void;
    guardarNotaSesion: (email: string, index: number, nota: string) => Promise<void>;
  }
  
  const PatientCard = ({
    paciente,
    pacienteExpandido,
    setPacienteExpandido,
    setPacienteEditando,
    setPacienteAEliminar,
    editandoNota,
    setEditandoNota,
    nuevaNota,
    setNuevaNota,
    guardarNotaGeneral,
    notaEditandoSesion,
    setNotaEditandoSesion,
    notaSesion,
    setNotaSesion,
    guardarNotaSesion,
  }: Props) => {
    return (
      <div className="bg-[#fdf8f4] border border-[#e0d6ca] rounded-xl shadow p-4 break-words overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-base font-semibold text-[#5f4b32]">{paciente.nombre}</p>
            <p className="text-sm text-gray-700 flex items-center gap-1 break-words">
              <Mail size={14} /> {paciente.email}
            </p>
            <p className="text-sm text-gray-700 flex items-center gap-1">
              <Phone size={14} /> {paciente.telefono}
            </p>
          </div>
  
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end">
            <button
              onClick={() => setPacienteEditando(paciente)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Pencil size={14} /> Editar
            </button>
  
            <button
              onClick={() => setPacienteAEliminar(paciente)}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 size={14} /> Eliminar
            </button>
  
            <button
              onClick={() =>
                setPacienteExpandido(
                  pacienteExpandido === paciente.email ? null : paciente.email
                )
              }
              className="text-xs text-[#5f4b32]"
            >
              {pacienteExpandido === paciente.email ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
        </div>
  
        {pacienteExpandido === paciente.email && (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="font-medium text-[#5f4b32] mb-1">Nota general:</p>
              {editandoNota === paciente.email ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full border border-gray-300 rounded p-2"
                    rows={3}
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarNotaGeneral(paciente.email, nuevaNota)}
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
                  <p className="text-gray-700 italic">
                    {paciente.notaGeneral || "Sin nota general"}
                  </p>
                  <button
                    onClick={() => {
                      setEditandoNota(paciente.email);
                      setNuevaNota(paciente.notaGeneral || "");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Editar nota
                  </button>
                </div>
              )}
            </div>
  
            <div>
              <p className="font-medium text-[#5f4b32] mb-1">Historial de sesiones:</p>
              {paciente.historial.length > 0 ? (
                <ul className="space-y-2">
                  {paciente.historial.map((cita, index) => (
                    <li key={index} className="bg-white p-3 border border-[#e0d6ca] rounded">
                      <p className="text-sm flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#5f4b32]" />
                        {formatearFecha(cita.fecha)} a las {cita.hora}
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <Activity size={14} className="text-green-700" /> Estado: {cita.estado}
                      </p>
                      <div className="flex justify-between items-start">
                        {notaEditandoSesion?.email === paciente.email &&
                        notaEditandoSesion.index === index ? (
                          <div className="w-full space-y-2">
                            <textarea
                              className="w-full border border-gray-300 rounded p-2"
                              rows={2}
                              value={notaSesion}
                              onChange={(e) => setNotaSesion(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  guardarNotaSesion(paciente.email, index, notaSesion)
                                }
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
                              onClick={() =>
                                setNotaEditandoSesion({ email: paciente.email, index })
                              }
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
          </div>
        )}
      </div>
    );
  };
  
  export default PatientCard;
  