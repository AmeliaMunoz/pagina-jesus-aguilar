
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ContactSection from "../components/ContactSection";

const AboutMePage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contacto") {
      const section = document.getElementById("contacto");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      <Header />
      <section className="bg-[#fdf8f4]  py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[auto_1fr] gap-10 items-start bg-white p-10 rounded-2xl shadow-xl">

          {/* Contenido principal */}
          <div>
            <h1 className="text-xl md:text-2xl text-gray-700 tracking-widest uppercase mb-8 font-semibold">Sobre mí</h1>
            <p className="text-gray-700 mb-4">
              Soy Jesús Aguilar, psicólogo especializado en el acompañamiento de adolescentes, familias y personas que atraviesan procesos de cambio emocional. Con experiencia clínica, mi trabajo se fundamenta en crear espacios de confianza, escucha y evolución personal.
            </p>

            <h2 className="text-2xl font-semibold text-[#b89b71] mt-10 mb-4">Formación académica y profesional</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
              <li>Graduado en Psicología por la UNED</li>
              <li>Especialización en Educación Emocional y Disciplina Positiva</li>
              <li>Experiencia en hospitales y consulta privada</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#b89b71] mt-10 mb-4">Áreas de intervención</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="bg-[#f9f4ee] p-4 rounded-lg shadow-sm">Ansiedad, estrés y regulación emocional</div>
              <div className="bg-[#f9f4ee] p-4 rounded-lg shadow-sm">Autoestima y desarrollo de la identidad</div>
              <div className="bg-[#f9f4ee] p-4 rounded-lg shadow-sm">Conflictos familiares y límites</div>
              <div className="bg-[#f9f4ee] p-4 rounded-lg shadow-sm">Gestión de conductas impulsivas y habilidades sociales</div>
              <div className="bg-[#f9f4ee] p-4 rounded-lg shadow-sm">Acompañamiento en momentos de crisis vital</div>
            </div>

            <h2 className="text-2xl font-semibold text-[#b89b71] mt-10 mb-4">Mi filosofía de trabajo</h2>
            <p className="text-gray-700 mb-4">
              Concibo la terapia como un proceso compartido donde cada persona es protagonista de su propio camino. Trabajo desde el respeto, la empatía y el compromiso profesional, fomentando espacios donde se pueda hablar con libertad, reencontrarse con uno mismo y construir nuevas formas de relacionarse con los demás.
            </p>
            <p className="text-gray-700 mb-4">
              Me inspiran enfoques humanistas, narrativos y sistémicos, y creo en la importancia de integrar herramientas creativas como el dibujo, la metáfora, el role-play o el cuerpo como lenguaje emocional.
            </p>

            <h2 className="text-2xl font-semibold text-[#b89b71] mt-10 mb-4">Mis valores como terapeuta</h2>
            <ul className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <li className="bg-[#fdf8f4] p-4 rounded-lg shadow">Escucha activa y sin juicios</li>
              <li className="bg-[#fdf8f4] p-4 rounded-lg shadow">Respeto al ritmo y proceso de cada persona</li>
              <li className="bg-[#fdf8f4] p-4 rounded-lg shadow">Vínculo terapéutico como base del cambio</li>
              <li className="bg-[#fdf8f4] p-4 rounded-lg shadow">Coherencia profesional y ética</li>
              <li className="bg-[#fdf8f4] p-4 rounded-lg shadow">Acompañamiento humano, cálido y cercano</li>
            </ul>

            <div className="mt-10 text-center">
              <Link to="/" className="inline-block bg-[#b89b71] text-white px-6 py-2 rounded hover:bg-[#9e855c] transition">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ContactSection/>
      <Footer />
    </>
  );
};

export default AboutMePage;