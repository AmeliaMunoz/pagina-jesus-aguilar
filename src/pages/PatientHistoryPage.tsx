import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Ban,
  HelpCircle,
  ClipboardList,
  XCircle,
} from "lucide-react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import UserLayout from "../layouts/UserLayout";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
}

const PatientHistoryPage = () => {
  const [historial, setHistorial] = useState<Cita[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const q = query(collection(db, "citas"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      const citas = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            fecha: data.fecha ?? "",
            hora: data.hora ?? "",
            estado: data.estado ?? "",
          };
        })
        .filter((cita) => cita.estado !== "pendiente")
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setHistorial(citas);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const estadoColor = {
    realizada: "text-green-600",
    anulada: "text-red-500",
    ausente: "text-yellow-500",
    rechazada: "text-gray-500",
  };

  const estadoIcon = {
    realizada: <CalendarCheck className="w-4 h-4" />,
    anulada: <Ban className="w-4 h-4" />,
    ausente: <HelpCircle className="w-4 h-4" />,
    rechazada: <XCircle className="w-4 h-4" />,
  };

  return (
    <UserLayout>
      <div className="w-full max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
          <div className="bg-white border border-[#e0d6ca] rounded-xl p-6 max-h-[70vh] md:max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-[#5f4b32]">
                Historial de citas
              </h2>
              <ClipboardList className="hidden lg:block w-10 h-10 text-[#5f4b32]" />
            </div>

            {historial.length === 0 ? (
              <p className="text-gray-600 text-sm md:text-base">
                No hay citas pasadas registradas.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 text-sm md:text-base text-[#5f4b32]">
                {historial.map((cita) => (
                  <li key={cita.id} className="py-3 flex justify-between items-center">
                    <span className="break-words">
                      {new Date(cita.fecha).toLocaleDateString("es-ES")} — {cita.hora}
                    </span>
                    <span
                      className={`flex items-center gap-2 font-medium capitalize ${
                        estadoColor[cita.estado as keyof typeof estadoColor] || "text-gray-600"
                      }`}
                    >
                      {estadoIcon[cita.estado as keyof typeof estadoIcon] || <HelpCircle className="w-4 h-4" />}
                      {cita.estado}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PatientHistoryPage;
