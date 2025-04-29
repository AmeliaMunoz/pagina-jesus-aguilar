import Button from "./Button";

const Hero = () => {
  return (
    <section className="bg-[#fdf8f4] px-4 py-16 sm:py-24 lg:py-28 text-center">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair text-gray-800 leading-snug mb-6">
          Acompañamiento psicológico <br /> para recuperar el bienestar
        </h1>

        {/* Subtítulo */}
        <p className="uppercase tracking-widest text-gray-600 text-sm sm:text-base mb-8">
          Jesús Aguilar, Psicólogo
        </p>

        {/* Botón */}
        <Button href="#contacto">RESERVAR</Button>

        {/* Imagen artística centrada (si la añades) */}
        <div className="mt-12 flex justify-center">
          {/* Imagen opcional aquí */}
        </div>
      </div>
    </section>
  );
};

export default Hero;






  
  