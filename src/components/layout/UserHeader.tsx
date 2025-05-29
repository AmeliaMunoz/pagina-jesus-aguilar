import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const UserHeader = () => {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre || "");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="w-full bg-[#fdf8f4] border-b border-[#e0d6ca] px-6 py-4 flex justify-start lg:justify-end">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#b89b71] flex items-center justify-center text-white font-bold text-base shadow">
          {nombre ? nombre.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="text-left lg:text-right leading-tight">
          <p className="text-sm font-semibold text-[#5f4b32]">{nombre || "Cargando..."}</p>
          <p className="text-xs text-[#9e7c52]">Área personal</p>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;




