import React from "react";
import { Smile, Users, HeartHandshake, Brain } from "lucide-react";
import Button from "../components/Button";

const AdolescentTherapySection = () => {
  return (
<section className="bg-[#fdf8f4] py-20 px-4 sm:px-6 md:px-20">
  <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-md p-6 sm:p-10 md:p-14">
    <div className="flex flex-col gap-14">
      <div className="flex-1">
        <h2 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
          Terapia para Adolescentes
        </h2>

        <p className="text-brown-700 text-base sm:text-lg mb-8">
          Espacio seguro para crecer, comprenderse y transformar emociones
        </p>

        <div className="bg-[#fcf7f2] border-l-4 border-brown-300 p-6 rounded-md mb-10">
          <p className="text-brown-800 text-base sm:text-lg">
            ¿Notas que tu hijo/a adolescente se aísla, explota con facilidad o no sabe cómo gestionar lo que le ocurre?
            <br />¿Te gustaría ayudarle pero no sabes cómo acercarte sin generar más conflicto?
          </p>
        </div>

        <div className="space-y-6 mb-10">
          <p className="text-brown-800 text-base sm:text-lg leading-relaxed">
            La adolescencia es una etapa de grandes cambios emocionales, físicos y sociales. Es normal que surjan inseguridades, conflictos familiares, dificultades emocionales o problemas de relación.
          </p>
          <p className="text-brown-800 text-base sm:text-lg leading-relaxed">
            Esta terapia ofrece un espacio de validación, escucha y acompañamiento para que los adolescentes puedan comprenderse, expresarse libremente y desarrollar herramientas para su bienestar emocional.
          </p>
        </div>

        <ul className="space-y-5 text-brown-800 mb-12">
          {/* tus <li> con iconos aquí */}
        </ul>

        <div className="mb-12 space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-brown-900">
            También trabajamos con las familias
          </h3>
          <p className="text-brown-800 text-base sm:text-lg">
            Entender el mundo emocional de un/a adolescente no siempre es fácil. Por eso, también acompaño a las familias en el proceso, ayudándoles a establecer límites saludables, mejorar la comunicación y construir un entorno de confianza.
          </p>
        </div>

        <div className="bg-[#fcf7f2] border-l-4 border-brown-300 p-6 rounded-md mb-10">
          <p className="italic text-brown-800 mb-2">
            “Sentía que nadie me entendía, y ahora sé cómo poner palabras a lo que siento.”
          </p>
          <p className="text-sm text-brown-600 text-right">– Lucía, 15 años (nombre ficticio)</p>
        </div>

        <p className="text-brown-900 font-semibold mb-10 text-lg sm:text-xl text-center">
          Porque sentirse escuchado y comprendido en esta etapa… lo cambia todo.
        </p>

        <div className="text-center">
          <Button href="#contacto">
            Solicita tu cita
          </Button> 
        </div>
      </div>
    </div>
  </div>
</section>

  );
};

export default AdolescentTherapySection;






