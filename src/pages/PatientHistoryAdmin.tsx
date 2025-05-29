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
import ManualAppointmentModal from "../components/admin/ManualAppointmentModal";
import ConfirmDeleteModal from "../components/admin/ConfirmDeleteModal";
import PatientCard from "../components/admin/PatientCardAdmin";

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
    const snapshot = await getDocs(collection(db, "pacientes"));
    const docSnap = snapshot.docs.find((d) => d.id === email);
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
                  <PatientCard
                    key={paciente.email}
                    paciente={paciente}
                    pacienteExpandido={pacienteExpandido}
                    setPacienteExpandido={setPacienteExpandido}
                    setPacienteEditando={setPacienteEditando}
                    setPacienteAEliminar={setPacienteAEliminar}
                    editandoNota={editandoNota}
                    setEditandoNota={setEditandoNota}
                    nuevaNota={nuevaNota}
                    setNuevaNota={setNuevaNota}
                    guardarNotaGeneral={guardarNotaGeneral}
                    notaEditandoSesion={notaEditandoSesion}
                    setNotaEditandoSesion={setNotaEditandoSesion}
                    notaSesion={notaSesion}
                    setNotaSesion={setNotaSesion}
                    guardarNotaSesion={guardarNotaSesion}
                  />
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
          <ConfirmDeleteModal
            nombre={pacienteAEliminar.nombre}
            onConfirm={eliminarPacienteConfirmado}
            onCancel={() => setPacienteAEliminar(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default PatientHistoryAdmin;

