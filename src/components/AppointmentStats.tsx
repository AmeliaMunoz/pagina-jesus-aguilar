import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { HelpCircle } from "lucide-react";

const diasSemanaOrdenados = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const coloresEstados = ["#5f4b32", "#a1512d", "#b89b71", "#d8c4aa"];

const AppointmentStats = () => {
  const [porDia, setPorDia] = useState<any[]>([]);
  const [porHora, setPorHora] = useState<any[]>([]);
  const [porMes, setPorMes] = useState<any[]>([]);
  const [porEstado, setPorEstado] = useState<any[]>([]);

  const [totalCitas, setTotalCitas] = useState(0);
  const [ausencias, setAusencias] = useState(0);
  const [altas, setAltas] = useState(0);
  const [pacientesInactivos, setPacientesInactivos] = useState(0);
  const [abandono, setAbandono] = useState(0);
  const [frecuenciaMedia, setFrecuenciaMedia] = useState(0);
  const [mediaSesionesAlta, setMediaSesionesAlta] = useState(0);

  const obtenerEstadisticas = async () => {
    const citasSnap = await getDocs(collection(db, "mensajes"));
    const pacientesSnap = await getDocs(collection(db, "pacientes"));

    const dias: Record<string, number> = {};
    const horas: Record<string, number> = {};
    const meses: Record<string, { label: string; date: Date; total: number }> = {};
    const estados: Record<string, number> = {};
    let total = 0;
    let ausentes = 0;

    citasSnap.docs.forEach(doc => {
      const data = doc.data();
      const fecha = data.fechaPropuesta?.toDate();
      const hora = data.horaPropuesta;
      const estado = data.estado;

      if (!fecha || !hora) return;

      const mesClave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}`;
      const mesLabel = fecha.toLocaleDateString("es-ES", { year: "numeric", month: "short" });

      if (!meses[mesClave]) {
        meses[mesClave] = {
          label: mesLabel,
          date: new Date(fecha.getFullYear(), fecha.getMonth(), 1),
          total: 0,
        };
      }

      meses[mesClave].total += 1;
      estados[estado] = (estados[estado] || 0) + 1;

      if (estado === "aprobada") {
        const diaIndex = fecha.getDay();
        const nombreDia = diasSemanaOrdenados[(diaIndex + 6) % 7];
        dias[nombreDia] = (dias[nombreDia] || 0) + 1;

        const [h] = hora.split(":");
        const horaRedonda = `${h.padStart(2, "0")}:00`;
        horas[horaRedonda] = (horas[horaRedonda] || 0) + 1;
      }

      total += 1;
      if (estado === "ausente") ausentes += 1;
    });

    const datosDias = diasSemanaOrdenados.map(dia => ({ dia, total: dias[dia] || 0 }));
    const datosHoras = Object.entries(horas).sort(([a], [b]) => a.localeCompare(b)).map(([hora, total]) => ({ hora, total }));
    const datosMeses = Object.values(meses).sort((a, b) => a.date.getTime() - b.date.getTime()).map(({ label, total }) => ({ mes: label, total }));
    const datosEstados = Object.entries(estados).map(([estado, total]) => ({ name: estado, value: total }));

    setPorDia(datosDias);
    setPorHora(datosHoras);
    setPorMes(datosMeses);
    setPorEstado(datosEstados);
    setTotalCitas(total);
    setAusencias(ausentes);

    const pacientes = pacientesSnap.docs.map(doc => doc.data());
    const pacientesConAlta = pacientes.filter(p => p.estado === "alta");
    setAltas(pacientesConAlta.length);

    const hoy = new Date();
    const inactivos = pacientes.filter(p => {
      const ultima = p.ultima_cita?.toDate?.() || new Date(0);
      const dias = (hoy.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24);
      return dias > 60;
    });
    setPacientesInactivos(inactivos.length);

    const abandonos = pacientes.filter(p => {
      const total = p.historial?.length || 0;
      const ultima = p.ultima_cita?.toDate?.() || new Date(0);
      const dias = (hoy.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24);
      return total < 2 && dias > 90;
    });
    setAbandono(abandonos.length);

    const frecuencias: number[] = [];
    pacientes.forEach(p => {
      const citas = p.historial || [];
      if (citas.length > 1) {
        const fechas = citas.map((c: any) => c.fecha?.toDate?.()).filter(Boolean).sort((a: any, b: any) => a - b);
        const intervalos = fechas.slice(1).map((f: any, i: number) => (f - fechas[i]) / (1000 * 60 * 60 * 24));
        const media = intervalos.reduce((a: any, b: any) => a + b, 0) / intervalos.length;
        frecuencias.push(media);
      }
    });
    setFrecuenciaMedia(frecuencias.length ? Math.round(frecuencias.reduce((a, b) => a + b, 0) / frecuencias.length) : 0);

    const sesionesAlta = pacientesConAlta.map(p => p.historial?.length || 0);
    setMediaSesionesAlta(sesionesAlta.length ? Math.round(sesionesAlta.reduce((a, b) => a + b, 0) / sesionesAlta.length) : 0);
  };

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  const tasaAusencias = totalCitas === 0 ? 0 : ((ausencias / totalCitas) * 100).toFixed(1);

  return (
    <section className="max-w-6xl w-full mx-auto px-4 py-10 space-y-16">
      <h1 className="text-xl md:text-2xl font-semibold text-[#5f4b32] mb-8">Estadísticas de citas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[{ label: "Total de citas", value: totalCitas, color: "#5f4b32" },
          { label: "Citas ausentes", value: ausencias, color: "#a1512d" },
          { label: "Tasa de ausencias", value: `${tasaAusencias}%`, color: "#b89b71" },
          { label: "Pacientes dados de alta", value: altas, color: "#4b8063" },
          { label: "Pacientes inactivos", value: pacientesInactivos, color: "#856f56" },
          { label: "Abandonos de sesión", value: abandono, color: "#9c3d3d" },
          { label: "Frecuencia media (días)", value: frecuenciaMedia, color: "#7c6244" },
          { label: "Media de sesiones hasta alta", value: mediaSesionesAlta, color: "#c89b6e" }].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <h4 className="text-sm text-gray-600 mb-2 text-center">{label}</h4>
              <p className="text-3xl font-extrabold" style={{ color }}>{value}</p>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white rounded-xl shadow p-4 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-[#5f4b32] mb-4">Proporción por estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={porEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {porEstado.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={coloresEstados[i % coloresEstados.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4 min-w-0">
          <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">Citas por mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={porMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" stroke="#b89b71" fill="#f5ebe0" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 min-w-0">
        <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">Distribución por día de la semana</h3>
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

      <div className="bg-white rounded-xl shadow p-4 min-w-0">
        <h3 className="text-lg font-semibold text-[#5f4b32] mb-4">Distribución por hora del día</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={porHora}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#5f4b32" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-4 md:p-6 border border-[#e0d6ca]">
        <h3 className="text-lg font-semibold text-[#5f4b32] mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" /> ¿Cómo interpretar las gráficas?
        </h3>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
          <li><strong>Proporción por estado:</strong> Citas agrupadas según su estado (aprobada, ausente, rechazada...)</li>
          <li><strong>Citas por mes:</strong> Evolución mensual de citas programadas</li>
          <li><strong>Día de la semana:</strong> Días con más actividad confirmada</li>
          <li><strong>Hora del día:</strong> Rangos horarios con más sesiones</li>
          <li><strong>Tarjetas resumen:</strong> Indicadores clave como ausencias, frecuencia, altas e inactividad</li>
        </ul>
      </div>
    </section>
  );
};

export default AppointmentStats;
