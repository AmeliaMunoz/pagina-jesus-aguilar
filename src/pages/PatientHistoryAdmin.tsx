import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import ManualAppointmentModal from "../components/ManualAppointmentModal";
import {
  Mail,
  Phone,
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  Activity,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";

interface CitaHistorial {
  fecha: string;
  hora: string;
  estado: string;
  nota?: string;
}

type DatosPaciente = {
  nombre: string;
  email: string;
  telefono: string;
  nota?: string;
};

interface Paciente {
  nombre: string;
  email: string;
  telefono: string;
  historial: CitaHistorial[];
}

const PatientHistory = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalEdicionPaciente, setModalEdicionPaciente] = useState<Paciente | null>(null);
  const location = useLocation();

  useEffect(() => {
    cargarPacientes();
  }, [location.pathname]);

  const cargarPacientes = async () => {
    const snapshot = await getDocs(collection(db, "pacientes"));
    const datos = snapshot.docs.map((doc) => doc.data() as Paciente);
    setPacientes(datos);
    setCargando(false);
  };

  const guardarDatosPaciente = async (
    paciente: Paciente,
    nuevosDatos: DatosPaciente
  ) => {
    const ref = doc(db, "pacientes", paciente.email);
    await updateDoc(ref, {
      nombre: nuevosDatos.nombre,
      telefono: nuevosDatos.telefono,
      email: nuevosDatos.email,
    });
    cargarPacientes();
    setModalEdicionPaciente(null);
  };

  const eliminarPaciente = async (email: string) => {
    await deleteDoc(doc(db, "pacientes", email));
    cargarPacientes();
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const pacientesPorLetra = pacientesFiltrados
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .reduce((grupos: Record<string, Paciente[]>, paciente) => {
      const letra = paciente.nombre.charAt(0).toUpperCase();
      if (!grupos[letra]) grupos[letra] = [];
      grupos[letra].push(paciente);
      return grupos;
    }, {});

  return (
    <AdminLayout>
      <div className="w-full max-w-5xl bg-white border border-[#e0d6ca] rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-semibold text-[#5f4b32] mb-8 text-center md:text-left">
          Historial de pacientes
        </h2>

        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md mb-8 px-4 py-2 border border-gray-300 rounded text-sm"
        />

        {cargando ? (
          <p className="text-center text-[#5f4b32]">Cargando pacientes...</p>
        ) : Object.keys(pacientesPorLetra).length === 0 ? (
          <p className="text-center text-gray-600">No se encontraron pacientes.</p>
        ) : (
          <div className="space-y-12">
            {Object.entries(pacientesPorLetra).map(([letra, pacientesGrupo]) => (
              <div key={letra}>
                <h3 className="text-xl font-bold text-[#5f4b32] mb-4">{letra}</h3>
                <div className="space-y-8">
                  {pacientesGrupo.map((paciente, index) => (
                    <div
                      key={index}
                      className="bg-[#fdf8f4] border border-[#e8d4c3] rounded-xl shadow-sm p-6"
                    >
                      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">{paciente.nombre}</p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Mail size={16} className="text-[#5f4b32]" />
                            {paciente.email}
                          </p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Phone size={16} className="text-[#5f4b32]" />
                            {paciente.telefono}
                          </p>
                        </div>
                        <div className="flex gap-2 text-right">
                          <button
                            onClick={() => setModalEdicionPaciente(paciente)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Pencil size={14} className="text-[#5f4b32]" /> Editar
                          </button>
                          <button
                            onClick={() => eliminarPaciente(paciente.email)}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <Trash2 size={14} className="text-red-600" /> Eliminar
                          </button>
                        </div>
                      </div>

                      {paciente.historial?.length > 0 ? (
                        <ul className="space-y-4">
                          {paciente.historial.map((cita, i) => (
                            <li
                              key={i}
                              className="bg-white p-4 border border-[#d6c4b0] rounded-xl space-y-1"
                            >
                              <p className="text-sm flex items-center gap-2">
                                <CalendarDays size={16} className="text-[#5f4b32]" />
                                {cita.fecha} a las {cita.hora}
                              </p>
                              <p className="text-sm flex items-center gap-2">
                                <Activity size={16} className="text-green-700" />
                                Estado: {cita.estado}
                              </p>
                              {cita.nota && (
                                <p className="text-sm italic flex items-center gap-2">
                                  <FileText size={16} className="text-[#b89b71]" />
                                  {cita.nota}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Este paciente no tiene citas aún.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalEdicionPaciente && (
        <ManualAppointmentModal
          fecha={new Date()}
          hora={"10:00"}
          onClose={() => setModalEdicionPaciente(null)}
          onSave={(datos: DatosPaciente) =>
            guardarDatosPaciente(modalEdicionPaciente!, datos)
          }
          nombre={modalEdicionPaciente.nombre}
          email={modalEdicionPaciente.email}
          telefono={modalEdicionPaciente.telefono}
          nota={""}
          modoEdicion
          soloEditarPaciente
        />
      )}
    </AdminLayout>
  );
};

export default PatientHistory;

