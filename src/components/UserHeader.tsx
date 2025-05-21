import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const UserHeader = () => {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const fetchNombre = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const user = docSnap.data();
        setNombre(user.nombre || "");
      }
    };

    fetchNombre();
  }, []);

  return (
    <header className="w-full bg-[#fdf8f4] border-b border-[#e0d6ca] px-6 py-4 flex justify-start lg:justify-end">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#b89b71] flex items-center justify-center text-white font-bold text-base shadow">
          {nombre.charAt(0)}
        </div>
        <div className="text-left lg:text-right leading-tight">
          <p className="text-sm font-semibold text-[#5f4b32]">{nombre}</p>
          <p className="text-xs text-[#9e7c52]">Área personal</p>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;



