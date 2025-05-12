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
import UserLayout from "../layouts/UserLayout";
import {
  CalendarCheck2,
  MessageSquareText,
  History,
  PlusCircle,
} from "lucide-react";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  anuladaPorUsuario: boolean;
}

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
      <div className="w-full max-w-4xl mx-auto mt-10 md:mt-16 lg:mt-24 space-y-16 px-4">
        {/* Bienvenida */}
        <div className="bg-white border border-[#e0d6ca] shadow-xl rounded-2xl p-6 md:p-10 text-[#5f4b32]">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            ¡Hola, {nombre}!
          </h1>
          <p className="text-sm md:text-base">
            Bienvenido a tu espacio personal. Aquí puedes gestionar tus sesiones, revisar tu progreso y mantener el contacto con tu psicólogo.
          </p>
        </div>

        {/* Estado actual */}
        <div className="bg-[#fdf8f4] border border-[#e0d6ca] rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[#5f4b32] flex items-center gap-2">
            Tu situación actual
          </h2>

          <ul className="text-sm text-[#5f4b32] space-y-4">
            <li className="flex items-start gap-2">
              <CalendarCheck2 className="w-5 h-5 mt-0.5 text-green-700" />
              <span>
                Próxima cita:{" "}
                {proximaCita
                  ? `${new Date(proximaCita.fecha).toLocaleDateString("es-ES")} a las ${proximaCita.hora}`
                  : "No tienes ninguna cita pendiente"}
              </span>
            </li>

            <li className="flex items-start gap-2">
              <MessageSquareText className="w-5 h-5 mt-0.5 text-yellow-700" />
              <span>Puedes enviar un mensaje privado en cualquier momento</span>
            </li>

            <li className="flex items-start gap-2">
              <History className="w-5 h-5 mt-0.5 text-blue-700" />
              <span>Accede a tu historial para ver tus sesiones anteriores</span>
            </li>
          </ul>
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/panel/paciente/reservar")}
            className="flex items-center justify-center gap-2 bg-[#5f4b32] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#a37c53] transition"
          >
            <PlusCircle className="w-5 h-5" /> Reservar nueva cita
          </button>

          <button
            onClick={() => navigate("/panel/paciente/historial")}
            className="flex items-center justify-center gap-2 border border-[#5f4b32] text-[#5f4b32] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#f3ece4] transition"
          >
            <History className="w-5 h-5" /> Ver historial
          </button>

          <button
            onClick={() => navigate("/panel/paciente/mensajes")}
            className="flex items-center justify-center gap-2 border border-[#5f4b32] text-[#5f4b32] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#f3ece4] transition"
          >
            <MessageSquareText className="w-5 h-5" /> Ir a mensajes
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default User;










