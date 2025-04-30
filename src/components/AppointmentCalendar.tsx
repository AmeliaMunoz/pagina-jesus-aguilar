import { useEffect, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  ToolbarProps,
  SlotInfo,
  View,
  Event,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { holidays2025 } from "../data/holidays";
import ManualAppointmentModal from "./ManualAppointmentModal";
import EditAppointmentModal from "./EditAppointmentModal";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<any>) => {
  return (
    <div className="mb-4 space-y-3 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate("PREV")}
          className="text-xl text-[#5f4b32] hover:text-[#b89b71] px-4"
        >
          ←
        </button>
        <span className="text-base font-semibold text-gray-800 text-center flex-1">
          {label}
        </span>
        <button
          onClick={() => onNavigate("NEXT")}
          className="text-xl text-[#5f4b32] hover:text-[#b89b71] px-4"
        >
          →
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {[
          { label: "Mes", value: "month" },
          { label: "Semana", value: "week" },
          { label: "Día", value: "day" },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onView(value as View)}
            className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
              view === value
                ? "bg-[#b89b71] text-white border-[#b89b71]"
                : "bg-white text-[#5f4b32] border-[#c8b29d] hover:text-[#b89b71]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    nota?: string;
  };
}

const AppointmentCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [festivos, setFestivos] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);

  const cargarEventos = async () => {
    const q = query(collection(db, "mensajes"), where("estado", "==", "aprobada"));
    const snapshot = await getDocs(q);

    const citas = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const fecha = data.fechaPropuesta?.toDate();
        const hora = data.horaPropuesta || "00:00";

        if (!fecha || !hora) return null;

        const [h, m] = hora.split(":").map(Number);
        const start = new Date(fecha);
        start.setHours(h);
        start.setMinutes(m);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + (data.duracionMinutos || 60));

        return {
          id: doc.id,
          title: data.nombre,
          start,
          end,
          resource: {
            id: doc.id,
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono || "",
            nota: data.mensaje || "",
          },
        } as CalendarEvent;
      })
      .filter((e): e is CalendarEvent => e !== null);

    const festivosEventos: CalendarEvent[] = holidays2025.map((fecha) => {
      const [year, month, day] = fecha.split("-").map(Number);
      const start = new Date(year, month - 1, day, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59);
      return {
        id: fecha,
        title: "Festivo",
        start,
        end,
      };
    });

    setEventos(citas);
    setFestivos(festivosEventos);
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const day = slotInfo.start.getDay();
    if (day === 0 || day === 6) return;

    if (view === "day") {
      setSelectedSlot(slotInfo);
      setModalOpen(true);
    } else {
      setDate(slotInfo.start);
      setView("day");
    }
  };

  const slotPropGetter = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return {
        style: {
          backgroundColor: "#f4e9e1",
          pointerEvents: "none" as React.CSSProperties["pointerEvents"],
          opacity: 0.5,
        },
      };
    }
    return {};
  };

  const guardarCitaEnHistorial = async (
    email: string,
    nombre: string,
    telefono: string,
    cita: any
  ) => {
    const ref = doc(db, "pacientes", email);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, {
        historial: arrayUnion(cita),
      });
    } else {
      await setDoc(ref, {
        nombre,
        email,
        telefono,
        creado: serverTimestamp(),
        historial: [cita],
      });
    }
  };

  const eliminarCitaDeHistorial = async (email: string, fecha: string, hora: string) => {
    const ref = doc(db, "pacientes", email);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    const historialActualizado = (data.historial || []).filter(
      (cita: any) => cita.fecha !== fecha || cita.hora !== hora
    );

    await updateDoc(ref, { historial: historialActualizado });
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSlot(null);
    setEditEvent(null);
  };

  const refreshAfterSave = async () => {
    closeModal();
    await cargarEventos();
  };

  return (
    <div className="max-w-6xl mx-auto mt-16 px-4 sm:px-6">
      <div className="overflow-x-auto">
        <Calendar
          localizer={localizer}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          view={view}
          onView={(v) => setView(v)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event) => {
            setEditEvent(event as CalendarEvent);
          }}
          selectable
          events={[...eventos, ...festivos]}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "500px" }}
          views={["month", "week", "day"]}
          defaultView="month"
          messages={{
            previous: "←",
            next: "→",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
          components={{ toolbar: CustomToolbar }}
          eventPropGetter={(event) => {
            if (event.title === "Festivo") {
              return {
                style: {
                  backgroundColor: "#fff4da",
                  color: "#a1763c",
                  fontWeight: "bold",
                  border: "1px solid #e1c9a0",
                  borderRadius: "6px",
                },
              };
            }
            return {};
          }}
          slotPropGetter={slotPropGetter}
        />
      </div>

      {modalOpen && selectedSlot && (
        <ManualAppointmentModal
          fecha={selectedSlot.start}
          hora={selectedSlot.start.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          onClose={closeModal}
          onSave={refreshAfterSave}
        />
      )}

      {editEvent && editEvent.resource && (
        <EditAppointmentModal
          id={editEvent.id}
          fecha={editEvent.start}
          hora={editEvent.start.toTimeString().slice(0, 5)}
          nombre={editEvent.resource.nombre}
          email={editEvent.resource.email}
          telefono={editEvent.resource.telefono || ""}
          nota={editEvent.resource.nota}
          onClose={() => setEditEvent(null)}
          onUpdate={refreshAfterSave}
          onDeleteFromHistory={() =>
            eliminarCitaDeHistorial(
              editEvent.resource!.email,
              format(editEvent.start, "yyyy-MM-dd"),
              format(editEvent.start, "HH:mm")
            )
          }
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;




























