import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BookAppointmentFromUser from "../components/BookAppointmentFromUser";
import UserLayout from "../layouts/UserLayout";

const BookAppointmentPage = () => {
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
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  if (!userUid || !userEmail || !userName) {
    return <p className="p-6 text-gray-600">Cargando calendario...</p>;
  }

  return (
    <UserLayout>
      <div className="w-full max-w-4xl mx-auto mt-10 px-4 space-y-12">
        <h1 className="text-2xl md:text-3xl font-bold text-[#5f4b32] text-center md:text-left">
        </h1>

        {/* Card de reserva */}
        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#e0d6ca] p-6 md:p-10">
            <BookAppointmentFromUser
              uid={userUid}
              userEmail={userEmail}
              userName={userName}
              onBooked={() => navigate("/panel/paciente/proxima-cita")}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default BookAppointmentPage;





