import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  setDoc,
} from "firebase/firestore";
import UserLayout from "../layouts/UserLayout";
import {
  CalendarCheck2,
  AlertCircle,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import NextAppointmentCard from "../components/user/NextAppointmentCard";
import AppointmentMessageForm from "../components/user/AppointmentMessageForm";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  anuladaPorUsuario: boolean;
}

const NextAppointmentPage = () => {
  const [, setNombre] = useState("");
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNombre(data.nombre || "");
        }

        const q = query(
          collection(db, "citas"),
          where("email", "==", currentUser.email),
          where("estado", "==", "aprobada"),
          orderBy("fecha")
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const citaDoc = snapshot.docs[0];
          const data = citaDoc.data();
          setProximaCita({
            id: citaDoc.id,
            fecha: data.fecha ?? "",
            hora: data.hora ?? "",
            estado: data.estado ?? "",
            anuladaPorUsuario: data.anuladaPorUsuario ?? false,
          });
        }
      } catch (err) {
        console.error("Error cargando cita:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const liberarHoraEnDisponibilidad = async (fechaISO: string, hora: string) => {
    const ref = doc(db, "disponibilidad", fechaISO);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const nuevasHoras = data.horas ? [...data.horas, hora] : [hora];
      await updateDoc(ref, { horas: Array.from(new Set(nuevasHoras)) });
    } else {
      await setDoc(ref, { horas: [hora], fecha: fechaISO });
    }
  };

  const anularCita = async () => {
    setError("");
    setSuccess("");

    if (!proximaCita) return;

    const citaFecha = new Date(`${proximaCita.fecha}T${proximaCita.hora}`);
    const ahora = new Date();
    const horasRestantes = (citaFecha.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24) {
      setError("No puedes anular la cita. Faltan menos de 24h.");
      return;
    }

    await updateDoc(doc(db, "citas", proximaCita.id), {
      estado: "anulada",
      anuladaPorUsuario: true,
    });

    await liberarHoraEnDisponibilidad(proximaCita.fecha, proximaCita.hora);

    localStorage.setItem("recargar-disponibilidad", Date.now().toString());

    setProximaCita(null);
    setSuccess("Cita anulada correctamente.");
  };

  const enviarMensaje = (texto: string) => {
    if (!proximaCita) return;
    updateDoc(doc(db, "citas", proximaCita.id), {
      mensajeDelPaciente: texto,
    });
  };

  return (
    <UserLayout>
      <div className="w-full max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
          <div className="bg-white border border-[#e0d6ca] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#5f4b32]">Tu próxima cita</h2>
              <CalendarCheck2 className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Cargando cita...</p>
            ) : proximaCita ? (
              <>
                <NextAppointmentCard cita={proximaCita} onCancelar={anularCita} />
                <AppointmentMessageForm onSend={enviarMensaje} />
              </>
            ) : (
              <div className="flex items-center gap-2 text-[#5f4b32] text-sm">
                <AlertCircle className="w-5 h-5" />
                No tienes ninguna cita pendiente.
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-100 border border-red-300 rounded p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-700 text-sm bg-green-100 border border-green-300 rounded p-3">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NextAppointmentPage;
