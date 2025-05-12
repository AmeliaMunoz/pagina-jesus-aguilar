import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BookAppointmentFromUser from "../components/BookAppointmentFromUser";
import UserLayout from "../layouts/UserLayout";


const BookAppointmentPage = () => {
  const [bonoPendiente, setBonoPendiente] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userUid, setUserUid] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      setUserUid(currentUser.uid);
      setUserEmail(currentUser.email || "");

      const docRef = doc(db, "usuarios", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.nombre || "");
        setBonoPendiente(data.bono?.pendientes ?? 0);
      } else {
        setBonoPendiente(0);
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  if (bonoPendiente === null) {
    return <p className="p-6 text-gray-600">Cargando calendario...</p>;
  }

  return (
    <UserLayout>
      <div className="w-full max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold text-[#5f4b32] text-center md:text-left">
          {userName}
        </h1>

        <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
          <BookAppointmentFromUser
            uid={userUid}
            userEmail={userEmail}
            userName={userName}

            onBooked={() => navigate("/panel/paciente/proxima-cita")}
          />
        </div>
      </div>
    </UserLayout>
  );
};

export default BookAppointmentPage;



