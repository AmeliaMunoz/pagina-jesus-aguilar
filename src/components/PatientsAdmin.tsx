import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Mail,
  Phone,
  FolderOpen,
  CalendarDays,
  Activity,
  FileText,
  Trash2,
} from "lucide-react";

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
}

const PatientsAdmin = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargarPacientes = async () => {
    setCargando(true);
    const snapshot = await getDocs(collection(db, "pacientes"));
    const lista = snapshot.docs.map((doc) => doc.data() as Paciente);
    setPacientes(lista);
    setCargando(false);
  };

  const eliminarCita = async (email: string, cita: CitaHistorial) => {
    const pacienteRef = doc(db, "pacientes", email);
    const snapshot = await getDocs(collection(db, "pacientes"));
    const pacienteData = snapshot.docs.find((d) => d.data().email === email)?.data() as Paciente;

    if (!pacienteData) return;

    const nuevoHistorial = pacienteData.historial.filter(
      (c) =>
        !(
          c.fecha === cita.fecha &&
          c.hora === cita.hora &&
          c.estado === cita.estado &&
          (c.nota || "") === (cita.nota || "")
        )
    );

    await updateDoc(pacienteRef, {
      historial: nuevoHistorial,
    });

    cargarPacientes();
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-[#fdf8f4] min-h-screen scroll-smooth px-4 sm:px-6 py-8 sm:py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">
        Pacientes Registrados
      </h2>

      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-[#c8b29d] px-4 py-2 rounded text-sm"
        />
      </div>

      {cargando ? (
        <p className="text-center text-brown-700">Cargando pacientes...</p>
      ) : pacientesFiltrados.length === 0 ? (
        <p className="text-center text-brown-700">No hay pacientes registrados.</p>
      ) : (
        <div className="space-y-8">
          {pacientesFiltrados.map((paciente, idx) => (
            <div key={idx} className="border border-[#e8d4c3] rounded-xl p-6 bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#5f4b32]">{paciente.nombre}</h3>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Mail/>
                    {paciente.email}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Phone/>
                    {paciente.telefono}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <FolderOpen/>
                Total citas: {paciente.historial?.length || 0}
              </p>

              {paciente.historial && paciente.historial.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {paciente.historial.map((cita, i) => (
                    <li
                      key={i}
                      className="bg-[#fdf8f4] p-4 rounded border border-[#d6c4b0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div>
                        <p className="text-sm flex items-center gap-2">
                          <CalendarDays/>
                          {cita.fecha} a las {cita.hora}
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Activity/>
                          Estado: <span className="font-medium">{cita.estado}</span>
                        </p>
                        {cita.nota && (
                          <p className="text-sm italic flex items-center gap-2">
                            <FileText/>
                            {cita.nota}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => eliminarCita(paciente.email, cita)}
                          className="text-red-600 text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                          <Trash2/>
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Sin historial aún.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientsAdmin;




