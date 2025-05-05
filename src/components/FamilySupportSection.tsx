import Button from "../components/Button";
import { Check } from "lucide-react";

const FamilySupportSection = () => {
  return (
    <section className="bg-[#fdf8f4] shadow-sm py-20 px-4 sm:px-6 md:px-20 scroll-mt-20" id="acompanamiento-familiar">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-md p-6 sm:p-10 md:p-14">
        <h2 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-16 font-semibold">
          Acompañamiento Familiar desde el Respeto y la Empatía
        </h2>

        <div className="space-y-6 mb-10 font-sans text-base sm:text-lg leading-relaxed">
          <p>
            Acompaño a madres, padres y cuidadores que desean educar desde el respeto, el vínculo y la presencia.
            Mi enfoque parte de la idea de que los adultos también estamos aprendiendo, y que toda transformación familiar comienza con una mirada más consciente hacia las relaciones.
          </p>

          <p>
            En este espacio abordamos juntos/as los desafíos cotidianos de la crianza, revisamos patrones heredados
            y construimos nuevas formas de comunicarnos, poner límites y acompañar sin castigar.
            Lo hacemos sin juicio, con herramientas prácticas y desde la comprensión profunda del desarrollo infantil.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="flex items-start gap-3">
            <span className="text-xl">
              <Check/>
            </span>
            <span>Redirigir conductas difíciles sin recurrir al castigo</span>
          </div>
          <div className="flex items-start gap-3">
           <span className="text-xl">
              <Check/>
            </span>
            <span>Fomentar la autonomía, la autoestima y la responsabilidad</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">
              <Check/>
            </span>
            <span>Establecer normas claras desde el amor y el respeto</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">
              <Check/>
            </span>
            <span>Mejorar la comunicación y fortalecer el vínculo familiar</span>
          </div>
        </div>

        <div className="bg-[#fcf7f2] p-6 rounded-xl mb-12 border-l-4 border-amber-800 font-sans">
          <h3 className="text-lg font-semibold mb-2">Un hogar donde todos pueden crecer</h3>
          <p className="mb-2">
            La disciplina positiva no es una técnica, es una forma de mirar a nuestros hijos e hijas con más comprensión,
            firmeza y ternura a la vez. Es posible educar sin gritos ni castigos, sostener sin sobreproteger, y acompañar sin controlar.
          </p>
          <p>
            En este proceso, te ofrezco herramientas y acompañamiento para que puedas construir un hogar más sereno,
            consciente y conectado con las necesidades de todos sus miembros.
          </p>
        </div>

        <p className=" text-center text-lg mb-10">
          “No se trata de tener hijos perfectos, sino de construir relaciones sanas.”
        </p>

        <div className="text-center">
          <Button href="#contacto">
            Solicita tu cita 
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FamilySupportSection;




