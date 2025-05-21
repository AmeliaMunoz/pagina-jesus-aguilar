import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout";
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
import ManualAppointmentModal from "../components/ManualAppointmentModal";
import { formatearFecha } from "../utils/formatDate";

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

const PatientHistoryAdmin = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteExpandido, setPacienteExpandido] = useState<string | null>(null);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);
  const [editandoNota, setEditandoNota] = useState<string | null>(null);
  const [nuevaNota, setNuevaNota] = useState<string>("");
  const [notaEditandoSesion, setNotaEditandoSesion] = useState<{ email: string; index: number } | null>(null);
  const [notaSesion, setNotaSesion] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [pacienteAEliminar, setPacienteAEliminar] = useState<Paciente | null>(null);

  const cargarPacientes = async () => {
    const snapshot = await getDocs(collection(db, "pacientes"));
    const datos = snapshot.docs.map((doc) => ({ email: doc.id, ...doc.data() })) as Paciente[];
    setPacientes(datos);
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const guardarNotaGeneral = async (email: string, nota: string) => {
    await updateDoc(doc(db, "pacientes", email), { notaGeneral: nota });
    setEditandoNota(null);
    await cargarPacientes();
  };

  const guardarNotaSesion = async (email: string, index: number, nota: string) => {
    const ref = doc(db, "pacientes", email);
    const snap = await getDocs(collection(db, "pacientes"));
    const docSnap = snap.docs.find((d) => d.id === email);
    if (!docSnap) return;
    const data = docSnap.data() as Paciente;
    const historialActualizado = [...data.historial];
    historialActualizado[index].nota = nota;
    await updateDoc(ref, { historial: historialActualizado });
    setNotaEditandoSesion(null);
    await cargarPacientes();
  };

  const eliminarPacienteConfirmado = async () => {
    if (!pacienteAEliminar) return;

    try {
      const email = pacienteAEliminar.email;
      const citasSnap = await getDocs(collection(db, "citas"));
      const citasPaciente = citasSnap.docs.filter((doc) => doc.data().email === email);

      for (const cita of citasPaciente) {
        await deleteDoc(doc(db, "citas", cita.id));
      }

      await deleteDoc(doc(db, "pacientes", email));
      setPacientes((prev) => prev.filter((p) => p.email !== email));

      setMensajeExito(`🗑️ Paciente eliminado correctamente (${citasPaciente.length} citas borradas).`);
      setTimeout(() => setMensajeExito(""), 4000);
      setPacienteAEliminar(null);
    } catch (error) {
      console.error("❌ Error al eliminar paciente y sus citas:", error);
      setMensajeError("❌ Ocurrió un error al eliminar el paciente.");
      setTimeout(() => setMensajeError(""), 4000);
    }
  };

  const pacientesFiltrados = pacientes
    .filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.email.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const pacientesPorLetra = pacientesFiltrados.reduce((acc, paciente) => {
    const letra = paciente.nombre.charAt(0).toUpperCase();
    if (!acc[letra]) acc[letra] = [];
    acc[letra].push(paciente);
    return acc;
  }, {} as Record<string, Paciente[]>);

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl mx-auto px-4 mt-10 mb-20">
        <div className="bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-8 text-center md:text-left">
            Historial de pacientes
          </h2>

          <input
            type="text"
            placeholder="Buscar por nombre o email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full max-w-md mx-auto block mb-10 px-4 py-2 border border-gray-300 rounded text-sm"
          />

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

          {Object.entries(pacientesPorLetra).map(([letra, grupo]) => (
            <div key={letra} className="mb-8">
              <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">{letra}</h3>
              <div className="space-y-4">
                {grupo.map((paciente) => (
                 <div key={paciente.email} className="bg-[#fdf8f4] border border-[#e0d6ca] rounded-xl shadow p-4">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                   {/* Información del paciente */}
                   <div>
                     <p className="text-base font-semibold text-[#5f4b32]">{paciente.nombre}</p>
                     <p className="text-sm text-gray-700 flex items-center gap-1 break-words">
                       <Mail size={14} /> {paciente.email}
                     </p>
                     <p className="text-sm text-gray-700 flex items-center gap-1">
                       <Phone size={14} /> {paciente.telefono}
                     </p>
                   </div>
               
                   {/* Botones de acción */}
                   <div className="flex flex-wrap gap-2 sm:gap-3 ml-auto">
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
                                    {notaEditandoSesion?.email === paciente.email && notaEditandoSesion.index === index ? (
                                      <div className="w-full space-y-2">
                                        <textarea
                                          className="w-full border border-gray-300 rounded p-2"
                                          rows={2}
                                          value={notaSesion}
                                          onChange={(e) => setNotaSesion(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => guardarNotaSesion(paciente.email, index, notaSesion)}
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
                                            setNotaEditandoSesion({ email: paciente.email, index });
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {pacienteEditando && (
          <ManualAppointmentModal
            fecha={new Date()}
            hora={"10:00"}
            onClose={() => setPacienteEditando(null)}
            onSave={() => setPacienteEditando(null)}
            nombre={pacienteEditando.nombre}
            email={pacienteEditando.email}
            telefono={pacienteEditando.telefono}
            nota={""}
            modoEdicion
            soloEditarPaciente
          />
        )}

        {pacienteAEliminar && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-[#e0d6ca] max-w-md w-full text-center">
              <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">Confirmar eliminación</h3>
              <p className="text-sm text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar a <strong>{pacienteAEliminar.nombre}</strong> y todas sus citas? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={eliminarPacienteConfirmado}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setPacienteAEliminar(null)}
                  className="px-4 py-2 rounded bg-gray-300 text-gray-800 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PatientHistoryAdmin;

