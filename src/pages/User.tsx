import { useEffect, useState } from "react";
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
import UserWelcomeCard from "../components/user/UserWelcomeCard";
import UserStatusCard from "../components/user/UserStatusCard";
import UserQuickActions from "../components/user/UserQuickActions";

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
        <UserWelcomeCard nombre={nombre} />
        <UserStatusCard proximaCita={proximaCita} />
        <UserQuickActions />
      </div>
    </UserLayout>
  );
};

export default User;