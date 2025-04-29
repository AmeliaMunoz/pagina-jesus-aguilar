import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const WeeklySchedulePanel = () => {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState("lunes");
  const [nuevaHora, setNuevaHora] = useState("");

  useEffect(() => {
    cargarHorarios();
  }, []);

  const cargarHorarios = async () => {
    const snapshot = await getDocs(collection(db, "horarios_semanales"));
    const datos = snapshot.docs.map((doc) => ({
      dia: doc.id,
      horas: doc.data().horas || [],
    }));
    setHorarios(datos);
  };

  const agregarHora = async () => {
    if (!nuevaHora || !diaSeleccionado) return;

    const ref = doc(db, "horarios_semanales", diaSeleccionado);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      if (!data.horas.includes(nuevaHora)) {
        await updateDoc(ref, {
          horas: [...data.horas, nuevaHora],
        });
      }
    } else {
      await setDoc(ref, { horas: [nuevaHora] });
    }

    setNuevaHora("");
    cargarHorarios();
  };

  const eliminarHora = async (dia: string, hora: string) => {
    const ref = doc(db, "horarios_semanales", dia);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    const nuevasHoras = data.horas.filter((h: string) => h !== hora);

    if (nuevasHoras.length === 0) {
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, { horas: nuevasHoras });
    }

    cargarHorarios();
  };

  return (
    <div className="max-w-5xl mx-auto mt-20">
      <h2 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
        Configuración de disponibilidad por semanas
      </h2>

      {/* Añadir nueva hora */}
      <div className="bg-white border border-[#e8d4c3] p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-md font-medium mb-4 text-gray-800">
          Añadir hora disponible
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Día</label>
            <select
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm"
            >
              {diasSemana.map((dia) => (
                <option key={dia} value={dia}>
                  {dia.charAt(0).toUpperCase() + dia.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Hora</label>
            <input
              type="time"
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={agregarHora}
              className="bg-[#b89b71] hover:bg-[#9e855c] text-white px-6 py-2 rounded text-sm"
            >
              Añadir
            </button>
          </div>
        </div>
      </div>

      {/* Lista de horarios actuales */}
      <div className="space-y-6">
        {horarios.map((item) => (
          <div
            key={item.dia}
            className="bg-white border border-[#e8d4c3] rounded-xl shadow-sm p-6"
          >
            <h4 className="font-semibold text-brown-800 capitalize mb-3">
              {item.dia}
            </h4>
            <div className="flex flex-wrap gap-3">
              {item.horas.map((hora: string) => (
                <div
                  key={hora}
                  className="bg-[#fdf8f4] border border-[#d6c4b0] px-3 py-1 rounded-full text-sm text-gray-800 flex items-center gap-2"
                >
                  {hora}
                  <button
                    onClick={() => eliminarHora(item.dia, hora)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySchedulePanel;
