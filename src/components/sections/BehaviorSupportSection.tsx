import Button from "../common/Button";
import { Brain, Handshake, MessageCircle, Sprout } from "lucide-react";

const BehaviorSupportSection = () => {
  return (
    <section className="bg-[#fdf8f4] py-16 px-4 sm:px-6 md:px-20">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-md p-6 sm:p-8 md:p-12">
        <h2 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
          Intervención en Conducta y Gestión Emocional
        </h2>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          Acompaño a adolescentes que atraviesan dificultades para expresar lo que sienten, con conductas que a veces preocupan.
          Este espacio les ayuda a conocerse, comprender sus emociones y responder de forma más equilibrada.
        </p>

        <p className="text-base sm:text-lg leading-relaxed mb-6">
          La adolescencia puede traer explosiones de ira, aislamiento, impulsividad o falta de motivación.
          Estas conductas suelen ocultar emociones profundas, inseguridades o necesidad de orientación. 
          Mi labor es ayudarles a identificar qué hay detrás y dotarles de herramientas para gestionar esas emociones.
        </p>

        <p className="text-base sm:text-lg leading-relaxed mb-8">
          A través de sesiones individuales, los adolescentes ganan confianza en sí mismos, 
          mejoran su autoestima y desarrollan habilidades para afrontar los retos del día a día.
        </p>

       
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 mb-8">
            <li className="flex items-center gap-3">
              <Brain/>
              Gestionar el enfado y la frustración
            </li>
            <li className="flex items-center gap-3">
              <Sprout/>
              Mejorar su autoestima
            </li>
            <li className="flex items-center gap-3 md:col-start-1">
              <Handshake/>
              Fortalecer habilidades sociales
            </li>
            <li className="flex items-center gap-3 md:col-start-2">
              <MessageCircle/>
              Resolver conflictos sin romper el vínculo
            </li>
          </ul>

        <div className="bg-[#fcf7f2] p-6 rounded-xl mb-8 border-l-4 border-amber-800">
          <h3 className="text-lg font-semibold mb-2">Acompañamiento también a las familias</h3>
          <p>
            Ofrezco orientación a madres y padres que desean acompañar mejor a sus hijos/as adolescentes, 
            entendiendo sus emociones y estableciendo límites sanos sin romper la confianza.
          </p>
        </div>

        <p className="text-center italic text-lg mb-8">
          “Detrás de cada conducta hay una emoción que necesita ser escuchada.”
        </p>

        <div className="text-center">
          <Button href="#contacto">
            Solicita una cita 
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BehaviorSupportSection;



