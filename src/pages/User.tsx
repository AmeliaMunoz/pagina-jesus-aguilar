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

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const usuarioSnap = await getDoc(doc(db, "usuarios", user.uid));
      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();
        setNombre(data.nombre ?? "");
      }
  
      const q = query(
        collection(db, "citas"),
        where("uid", "==", user.uid),
        where("estado", "==", "aprobada"),
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
  }, []);  

  return (
    <UserLayout>
      <div className="w-full max-w-5xl mx-auto mt-10 md:mt-16 px-4 space-y-16">

        {/* Bienvenida */}
        <div className="relative bg-white border border-[#e0d6ca] shadow-xl rounded-2xl p-6 md:p-10 text-[#5f4b32]">
          <h1 className="text-3xl font-bold mb-2">¡Hola, {nombre}!</h1>
          <p className="text-base text-[#5f4b32]/90">
            Bienvenido a tu espacio personal. Aquí puedes gestionar tus sesiones, revisar tu progreso y mantener el contacto con tu psicólogo.
          </p>
          <div className="absolute top-4 right-4 opacity-10">
            <PlusCircle className="w-12 h-12 text-[#b89b71]" />
          </div>
        </div>

        {/* Estado actual */}
        <div className="bg-white border-l-4 border-[#b89b71] border-opacity-30 rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[#5f4b32] flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-[#5f4b32]" />
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
              <span>Puedes enviar un mensaje privado en cualquier momento.</span>
            </li>

            <li className="flex items-start gap-2">
              <History className="w-5 h-5 mt-0.5 text-blue-700" />
              <span>Consulta tu historial de sesiones anteriores.</span>
            </li>
          </ul>
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/panel/paciente/reservar")}
            className="flex items-center justify-center gap-2 bg-[#9e7c52] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#b89b71] transition shadow-md"
          >
            <PlusCircle className="w-5 h-5" /> Reservar nueva cita
          </button>

          <button
            onClick={() => navigate("/panel/paciente/historial")}
            className="flex items-center justify-center gap-2 border border-[#5f4b32] text-[#5f4b32] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#f3ece4] transition shadow-sm"
          >
            <History className="w-5 h-5" /> Ver historial
          </button>

          <button
            onClick={() => navigate("/panel/paciente/mensajes")}
            className="flex items-center justify-center gap-2 border border-[#5f4b32] text-[#5f4b32] rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#f3ece4] transition shadow-sm"
          >
            <MessageSquareText className="w-5 h-5" /> Ir a mensajes
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default User;










