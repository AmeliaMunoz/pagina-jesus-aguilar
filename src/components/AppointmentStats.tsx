import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";

const diasSemanaOrdenados = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const AppointmentStats = () => {
  const [porDia, setPorDia] = useState<any[]>([]);
  const [porHora, setPorHora] = useState<any[]>([]);
  const [totalCitas, setTotalCitas] = useState(0);
  const [ausencias, setAusencias] = useState(0);

  const obtenerEstadisticas = async () => {
    const snapshot = await getDocs(collection(db, "mensajes"));

    const dias: Record<string, number> = {};
    const horas: Record<string, number> = {};

    let total = 0;
    let ausentes = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const fecha = data.fechaPropuesta?.toDate();
      const hora = data.horaPropuesta;
      const estado = data.estado;

      if (!fecha || !hora) return;

      if (estado === "aprobada") {
        const diaIndex = fecha.getDay(); // 0 = Domingo
        const nombreDia = diasSemanaOrdenados[(diaIndex + 6) % 7];
        dias[nombreDia] = (dias[nombreDia] || 0) + 1;

        const [h] = hora.split(":");
        const horaRedonda = `${h.padStart(2, "0")}:00`;
        horas[horaRedonda] = (horas[horaRedonda] || 0) + 1;
      }

      total += 1;
      if (estado === "ausente") ausentes += 1;
    });

    const datosDias = diasSemanaOrdenados.map(dia => ({
      dia,
      total: dias[dia] || 0
    }));

    const datosHoras = Object.entries(horas)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hora, total]) => ({ hora, total }));

    setTotalCitas(total);
    setAusencias(ausentes);
    setPorDia(datosDias);
    setPorHora(datosHoras);
  };

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  const tasaAusencias = totalCitas === 0 ? 0 : ((ausencias / totalCitas) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <h2 className="text-2xl font-semibold text-[#5f4b32] mb-6">Estadísticas de Citas</h2>

   
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h4 className="text-sm text-gray-500">Total de citas</h4>
          <p className="text-3xl font-bold text-[#5f4b32]">{totalCitas}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h4 className="text-sm text-gray-500">Citas ausentes</h4>
          <p className="text-3xl font-bold text-[#a1512d]">{ausencias}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h4 className="text-sm text-gray-500">Tasa de ausencias</h4>
          <p className="text-3xl font-bold text-[#b89b71]">{tasaAusencias}%</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Citas por día de la semana</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porDia}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#b89b71" />
          </BarChart>
        </ResponsiveContainer>
      </div>

   
      <div>
        <h3 className="text-lg font-medium mb-4">Citas por hora del día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={porHora}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#5f4b32" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentStats;

