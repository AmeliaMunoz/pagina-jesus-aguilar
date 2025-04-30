import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const AvailabilityPanel = () => {
  const [availability, setAvailability] = useState<any[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    const snapshot = await getDocs(collection(db, "disponibilidad"));
    const data = snapshot.docs.map((doc) => ({
      date: doc.id,
      times: doc.data().horas || [],
    }));
    setAvailability(data);
  };

  const addAvailability = async () => {
    if (!newDate || !newTime) return;
    const ref = doc(db, "disponibilidad", newDate);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!data.horas.includes(newTime)) {
        await updateDoc(ref, {
          horas: [...data.horas, newTime],
        });
      }
    } else {
      await setDoc(ref, {
        horas: [newTime],
      });
    }

    setNewTime("");
    loadAvailability();
  };

  const deleteTime = async (date: string, time: string) => {
    const ref = doc(db, "disponibilidad", date);
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const updatedTimes = data.horas.filter((t: string) => t !== time);

    if (updatedTimes.length === 0) {
      await deleteDate(date);
    } else {
      await updateDoc(ref, { horas: updatedTimes });
      loadAvailability();
    }
  };

  const deleteDate = async (date: string) => {
    await deleteDoc(doc(db, "disponibilidad", date));
    loadAvailability();
  };

  return (
    <div className="max-w-5xl mx-auto mt-20">
      <h2 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
      Configuración de disponibilidad por días
      </h2>

      
      <div className="bg-white border border-[#e8d4c3] p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-md font-medium mb-4 text-gray-800">
          Añadir dia y hora disponible
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Dia</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Hora</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addAvailability}
              className="bg-[#b89b71] hover:bg-[#9e855c] text-white px-6 py-2 rounded text-sm"
            >
              Añadir
            </button>
          </div>
        </div>
      </div>

     
      <div className="space-y-6">
        {availability.map((day) => (
          <div
            key={day.date}
            className="bg-white border border-[#e8d4c3] rounded-xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-brown-800">
                {new Date(day.date).toLocaleDateString()}
              </h4>
              <button
                onClick={() => deleteDate(day.date)}
                className="text-red-600 text-sm hover:underline"
              >
               Eliminar todo el día
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {day.times.map((time: string) => (
                <div
                  key={time}
                  className="bg-[#fdf8f4] border border-[#d6c4b0] px-3 py-1 rounded-full text-sm text-gray-800 flex items-center gap-2"
                >
                  {time}
                  <button
                    onClick={() => deleteTime(day.date, time)}
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

export default AvailabilityPanel;
