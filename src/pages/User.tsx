import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; 
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from "firebase/firestore";
import BookAppointmentFromUser from "../components/BookAppointmentFromUser";

interface Bono {
  total: number;
  usadas: number;
  pendientes: number;
}

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  anuladaPorUsuario: boolean;
}

const User = () => {
  const [bono, setBono] = useState<Bono | null>(null);
  const [nombre, setNombre] = useState("");
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const [historial, setHistorial] = useState<Cita[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [mensajeEnviado, setMensajeEnviado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificamos si el usuario está autenticado
    if (!auth.currentUser) {
      navigate("/login"); // Redirigir al login si no está autenticado
      return;
    }

    const fetchData = async () => {
      const uid = auth.currentUser?.uid; // Obtener el uid del usuario autenticado

      if (!uid) {
        navigate("/login"); // Si no hay uid, redirigir a login
        return;
      }

      // Usuario y bono
      const usuarioSnap = await getDoc(doc(db, "usuarios", uid));
      if (usuarioSnap.exists()) {
        const user = usuarioSnap.data();
        setNombre(user.nombre);
        setBono(user.bono);
      }

      // Próxima cita
      const q = query(
        collection(db, "citas"),
        where("uid", "==", uid),
        where("estado", "==", "pendiente"),
        orderBy("fecha")
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        setProximaCita({
          id: docSnap.id,
          fecha: data.fecha,
          hora: data.hora,
          estado: data.estado,
          anuladaPorUsuario: data.anuladaPorUsuario,
        });
      }

      // Historial
      const qHistorial = query(
        collection(db, "citas"),
        where("uid", "==", uid),
        where("estado", "in", ["realizada", "ausente", "anulada"]),
        orderBy("fecha", "desc")
      );

      const snapshotHistorial = await getDocs(qHistorial);
      const citasPasadas = snapshotHistorial.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          fecha: data.fecha,
          hora: data.hora,
          estado: data.estado,
          anuladaPorUsuario: data.anuladaPorUsuario ?? false,
        };
      });

      setHistorial(citasPasadas);
    };

    fetchData();
  }, [navigate]);

  const anularCita = async () => {
    if (!proximaCita) return;

    const citaFecha = new Date(`${proximaCita.fecha}T${proximaCita.hora}`);
    const ahora = new Date();
    const horasRestantes = (citaFecha.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24) {
      alert("No puedes anular la cita. Faltan menos de 24h.");
      return;
    }

    await updateDoc(doc(db, "citas", proximaCita.id), {
      estado: "anulada",
      anuladaPorUsuario: true,
    });

    alert("Cita anulada correctamente.");
    setProximaCita(null);
  };

  const enviarMensaje = async () => {
    if (!proximaCita || !mensaje.trim()) return;

    await updateDoc(doc(db, "citas", proximaCita.id), {
      mensajeDelPaciente: mensaje.trim(),
    });

    setMensaje("");
    setMensajeEnviado(true);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded space-y-6">
      <h1 className="text-2xl font-bold text-[#5f4b32]">Hola, {nombre}</h1>

      {/* Bono */}
      {bono ? (
        <div className="p-4 bg-[#fdf8f4] border rounded">
          <h2 className="text-lg font-semibold text-[#5f4b32] mb-2">Tu bono</h2>
          <p>Total: {bono.total}</p>
          <p>Usadas: {bono.usadas}</p>
          <p>Pendientes: {bono.pendientes}</p>
          {bono.pendientes === 0 && (
            <p className="mt-2 text-red-600 font-medium">
              ⚠️ Ya no te quedan sesiones disponibles.
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Cargando bono...</p>
      )}

      {/* Próxima cita */}
      {proximaCita ? (
        <div className="p-4 bg-[#fef6e4] border rounded">
          <h2 className="text-lg font-semibold text-[#5f4b32] mb-2">Próxima cita</h2>
          <p>
            Fecha: {new Date(proximaCita.fecha).toLocaleDateString("es-ES")} a las{" "}
            {proximaCita.hora}
          </p>
          <p>Estado: {proximaCita.estado}</p>

          {!proximaCita.anuladaPorUsuario && (
            <>
              <button
                onClick={anularCita}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Anular cita
              </button>

              {/* Mensaje privado */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Quieres compartir algo antes de la sesión?
                </label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Por ejemplo: me gustaría hablar sobre lo que pasó el fin de semana..."
                />
                <button
                  onClick={enviarMensaje}
                  className="mt-2 px-4 py-1 bg-[#5f4b32] text-white rounded hover:bg-[#b89b71]"
                >
                  Enviar mensaje
                </button>
                {mensajeEnviado && (
                  <p className="text-green-600 text-sm mt-2">Mensaje enviado correctamente.</p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-600">No tienes citas pendientes.</p>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div className="p-4 bg-[#f9f5ef] border rounded">
          <h2 className="text-lg font-semibold text-[#5f4b32] mb-3">Historial de citas</h2>
          <ul className="space-y-2">
            {historial.map((cita) => (
              <li
                key={cita.id}
                className="flex justify-between text-sm border-b pb-2 border-gray-200"
              >
                <span>
                  {new Date(cita.fecha).toLocaleDateString("es-ES")} — {cita.hora}
                </span>
                <span className="capitalize">
                  {cita.estado === "realizada" && "Realizada"}
                  {cita.estado === "anulada" && "Anulada"}
                  {cita.estado === "ausente" && "Ausente"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reserva de nueva cita */}
      {!proximaCita && bono && bono.pendientes > 0 && (
        <BookAppointmentFromUser
          uid={auth.currentUser?.uid || ""} // Usamos el uid del usuario autenticado
          userEmail={auth.currentUser?.email || ""}
          userName={nombre}
          bonoPendiente={bono.pendientes}
          onBooked={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default User;






