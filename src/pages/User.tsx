import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  Plus,
  Mail,
} from "lucide-react";
import PatientCard from "../components/PatientCard";
import UserLayout from "../layouts/UserLayout";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  anuladaPorUsuario: boolean;
}

const pacienteNav = [
  { label: "Próxima cita", path: "/panel/paciente/proxima-cita", icon: <Calendar /> },
  { label: "Historial de citas", path: "/panel/paciente/historial", icon: <Clock /> },
  { label: "Reservar nueva cita", path: "/panel/paciente/reservar", icon: <Plus /> },
  { label: "Mensajes privados", path: "/panel/paciente/mensajes", icon: <Mail /> },
];

const User = () => {
  const [nombre, setNombre] = useState<string>("");
  const [proximaCita, setProximaCita] = useState<Cita | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        navigate("/login");
        return;
      }

      const usuarioSnap = await getDoc(doc(db, "usuarios", uid));
      if (usuarioSnap.exists()) {
        const user = usuarioSnap.data();
        setNombre(user.nombre ?? "");
      }

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
          fecha: data.fecha ?? "",
          hora: data.hora ?? "",
          estado: data.estado ?? "",
          anuladaPorUsuario: data.anuladaPorUsuario ?? false,
        });
      }
    };

    fetchData();
  }, [navigate, location.pathname]);

  return (
    <UserLayout>
      <h1 className="text-3xl font-bold text-[#5f4b32] mb-10 w-full text-center md:text-left">
        ¡Hola, {nombre}!
      </h1>

      <div className="bg-white rounded-2xl shadow-3xl border border-[#e0d6ca] p-6 md:p-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {proximaCita && (
            <PatientCard title="Próxima cita">
              {new Date(proximaCita.fecha).toLocaleDateString("es-ES")},{" "}
              {proximaCita.hora}
            </PatientCard>
          )}

          <PatientCard
            title="Historial de citas"
            onClick={() => navigate("/panel/paciente/historial")}
          >
            Ver historial completo
          </PatientCard>

          <PatientCard
            title="Mensajes privados"
            onClick={() => navigate("/panel/paciente/mensajes")}
          >
            Ver mensajes
          </PatientCard>
        </div>
      </div>
    </UserLayout>
  );
};

export default User;





