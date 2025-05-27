import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { UserCog } from "lucide-react";

const AdminHeader = () => {
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
    <header className="w-full bg-[#fdf8f4] border-b border-[#e0d6ca] px-4 sm:px-6 py-4 flex justify-start lg:justify-end">
      <div className="flex items-center gap-3">
      
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#c1b5a4] flex items-center justify-center text-[#5f4b32] font-bold text-sm sm:text-base shadow">
          {nombre ? nombre.charAt(0).toUpperCase() : "?"}
        </div>

       
        <div className="text-left lg:text-right leading-tight">
          <p className="text-sm font-semibold text-[#5f4b32] truncate max-w-[140px] sm:max-w-none">
            {nombre}
          </p>
          <div className="flex items-center gap-1 text-xs text-[#9e7c52]">
            <UserCog className="w-4 h-4" />
            <span>Panel admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;



