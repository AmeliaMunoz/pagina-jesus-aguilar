import Button from "./Button";

const AboutMe = () => {
  return (
    <section id="sobre-mi" className="bg-[#fdf8f4]py-16 px-4 sm:px-6 scroll-mt-32">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
        {/* Imagen */}
        <div className="flex justify-center md:justify-start">
          <img
            src="/jesus-aguilar.jpeg"
            alt="Jesús Aguilar"
            className="w-32 h-32 rounded-full object-cover object-center shadow-md ring-2 ring-[#b89b71] transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Texto */}
        <div>
          <h2 className="text-lg md:text-xl text-gray-700 font-semibold tracking-widest uppercase mb-8">Sobre mí</h2>
          <p className="text-gray-700 mb-4 text-base sm:text-lg">
            Hola, soy Jesús Aguilar, psicólogo especializado en adolescentes y familias.
            Desde hace un tiempo acompaño a jóvenes y a sus familias en el camino hacia la disciplina positiva,
            guiando procesos de cambio, escucha y reconversión profunda de cada etapa del desarrollo.
          </p>
          <p className="text-gray-700 mb-4 text-base sm:text-lg">
            Mi vocación nació del deseo de ofrecer un espacio donde personas —especialmente adolescentes—
            puedan sentirse vistas, validadas, sin juicios ni etiquetas. En cada sesión construyo un vínculo
            concreto para mejorar conversaciones, poner límites con amor y fomentar vínculos con señales
            claras y duraderas.
          </p>
          <div className="mt-6">
            <Button href="/about">Conoce más sobre mí</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;

  