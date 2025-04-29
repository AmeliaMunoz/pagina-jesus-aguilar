import { Link } from "react-router-dom";
import IconEmocional from "./IconEmocional";
import IconFamily from "./IconFamily";
import IconAdolescent from "./IconAdolescent";

const TherapyTypes = () => {
  return (
    <section id="terapias" className="bg-white py-16 gap-6 px-6 text-center">
      <h2 className="text-lg md:text-xl font-semibold text-gray-700 tracking-widest uppercase mb-12">
        Tipos de terapia especializada
      </h2>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto text-gray-700">
        {/* Tarjeta 1 */}
        <Link to="/terapia-adolescente" className="hover:shadow-lg transition rounded-xl p-4">
          <div className="flex flex-col items-center">
            <div className="w-45 h-45 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <IconAdolescent/>
            </div>
            <h3 className="font-semibold uppercase text-sm mb-2">
              Terapia para adolescentes
            </h3>
            <p className="text-sm max-w-xs">
              <strong>Acompañamiento individual</strong> al bienestar emocional juvenil
            </p>
          </div>
        </Link>

        {/* Tarjeta 2 */}
        <Link to="/acompanamiento-familiar" className="hover:shadow-lg transition rounded-xl p-4">
          <div className="flex flex-col items-center">
            <div className="w-45 h-45 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <IconFamily/>
            </div>
            <h3 className="font-semibold uppercase text-sm mb-2 text-center">
              Acompañamiento familiar <br /> y disciplina positiva
            </h3>
            <p className="text-sm max-w-xs">
              Educación y crianza para una <strong>convivencia respetuosa</strong>
            </p>
          </div>
        </Link>

        {/* Tarjeta 3 */}
        <Link to="/intervencion-conducta" className="hover:shadow-lg transition rounded-xl p-4">
          <div className="flex flex-col items-center">
            <div className="w-45 h-45 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <IconEmocional/>
            </div>
            <h3 className="font-semibold uppercase text-sm mb-2 text-center">
              Intervención en conducta <br /> y gestión emocional
            </h3>
            <p className="text-sm max-w-xs">
              Manejo de <strong>impulsos</strong> y desarrollo de habilidades sociales
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default TherapyTypes;

  