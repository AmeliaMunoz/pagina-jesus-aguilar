import MessageCard from "./MessageCard";

interface Props {
  mensajesFiltrados: any[];
  filtroEstado: string;
  cambiarEstado: (
    id: string,
    estado: string,
    fecha?: string,
    hora?: string,
    msgData?: any
  ) => Promise<void>;
  eliminarMensaje: (id: string) => Promise<void>;
}

const MessageListByLetter = ({
  mensajesFiltrados,
  filtroEstado,
  cambiarEstado,
  eliminarMensaje,
}: Props) => {
  const agrupados = mensajesFiltrados.reduce<Record<string, any[]>>((acc, msg) => {
    const letra = msg.nombre.charAt(0).toUpperCase();
    if (!acc[letra]) acc[letra] = [];
    acc[letra].push(msg);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(agrupados).map(([letra, grupo]) => (
        <div key={letra} className="mb-6">
          <h3 className="text-lg font-bold text-[#5f4b32] mb-2">{letra}</h3>
          <div className="grid gap-6">
            {grupo.map((m) => (
              <MessageCard
                key={m.id}
                mensaje={m}
                filtroEstado={filtroEstado}
                onAprobar={() =>
                  cambiarEstado(
                    m.id,
                    "aprobada",
                    m.fechaPropuesta?.toDate()?.toISOString().split("T")[0],
                    m.horaPropuesta,
                    m
                  )
                }
                onRechazar={() =>
                  cambiarEstado(
                    m.id,
                    "rechazada",
                    m.fechaPropuesta?.toDate()?.toISOString().split("T")[0],
                    m.horaPropuesta,
                    m
                  )
                }
                onEliminar={() => eliminarMensaje(m.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default MessageListByLetter;
