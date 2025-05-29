import Button from "../common/Button";

const Hero = () => {
  return (
    <section className="bg-[#fdf8f4] px-4 sm:px-6 2xl:px-20 3xl:px-32 py-16 sm:py-24 lg:py-28 text-center">
      <div className="w-full max-w-5xl 3xl:max-w-6xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl 3xl:text-7xl font-playfair text-gray-800 leading-snug mb-6">
          Acompañamiento psicológico <br /> para recuperar el bienestar
        </h1>
        <p className="uppercase tracking-widest text-gray-600 text-sm sm:text-base lg:text-lg 2xl:text-xl 3xl:text-2xl mb-8">
          Jesús Aguilar, Psicólogo
        </p>
        <Button href="#contacto">RESERVAR</Button>
      </div>
    </section>
  );
};

export default Hero;








  
  