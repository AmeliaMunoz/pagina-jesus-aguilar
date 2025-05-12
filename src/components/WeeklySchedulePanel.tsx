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
import { X } from "lucide-react";

const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"];

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
      horas: (doc.data().horas || []).sort(),
    }));

    const datosOrdenados = diasSemana
      .map((dia) => datos.find((d) => d.dia === dia))
      .filter(Boolean);

    setHorarios(datosOrdenados as any[]);
  };

  const agregarHora = async () => {
    if (!nuevaHora || !diaSeleccionado) return;

    const ref = doc(db, "horarios_semanales", diaSeleccionado);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      if (!data.horas.includes(nuevaHora)) {
        await updateDoc(ref, {
          horas: [...data.horas, nuevaHora].sort(),
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
    <div className="max-w-5xl mx-auto mt-10">
      <div className="bg-white border border-[#e8d4c3] p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">
          Añadir hora disponible
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Día</label>
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

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Hora</label>
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
              className="bg-[#5f4b32] hover:bg-[#b89b71] text-white px-6 py-2 rounded text-sm w-full"
            >
              Añadir
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {horarios.map((item) => (
          <div
            key={item.dia}
            className="bg-white border border-[#e8d4c3] rounded-xl shadow-sm p-6"
          >
            <h4 className="font-semibold text-[#5f4b32] capitalize mb-3">
              {item.dia}
            </h4>

            {item.horas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay horas configuradas para este día.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {item.horas.map((hora: string) => (
                  <div
                    key={hora}
                    className="bg-[#fdf8f4] border border-[#d6c4b0] px-3 py-1 rounded-full text-sm text-gray-800 flex items-center gap-2"
                  >
                    {hora}
                    <button
                      onClick={() => eliminarHora(item.dia, hora)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Eliminar hora"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySchedulePanel;

