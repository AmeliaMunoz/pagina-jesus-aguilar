import { FaInstagram, FaWhatsapp, FaArrowUp } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../common/IconoLogo';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateAndScroll = (sectionId?: string) => {
    if (location.pathname === '/') {
      if (sectionId) {
        scrollToSection(sectionId);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        if (sectionId) {
          scrollToSection(sectionId);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 400);
    }
  };

  return (
    <footer className="hidden lg:block w-full bg-[#e8d4c3] text-gray-800 py-12 px-8 3xl:px-32">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-20 3xl:gap-32 place-items-center text-center lg:text-left">
    
    {/* Columna 1 */}
    <div className="flex flex-col gap-4 items-center lg:items-start max-w-[400px] w-full">
      <Logo className="w-20 h-20 mb-2" />
      <p className="text-sm 3xl:text-base">
        Psicología centrada en el bienestar emocional de adolescentes y familias.
      </p>
    </div>

    {/* Columna 2 */}
    <div className="flex flex-col gap-2 items-center lg:items-start max-w-[400px] w-full">
      <h4 className="text-base 3xl:text-lg font-semibold mb-4 uppercase tracking-wide">Navegación</h4>
      <ul className="space-y-2 text-sm 3xl:text-base">
        <li><button onClick={() => handleNavigateAndScroll()} className="hover:text-[#b89b71] transition">Inicio</button></li>
        <li><button onClick={() => handleNavigateAndScroll('terapias')} className="hover:text-[#b89b71] transition">Terapias</button></li>
        <li><button onClick={() => handleNavigateAndScroll('sobre-mi')} className="hover:text-[#b89b71] transition">Sobre mí</button></li>
        <li><button onClick={() => handleNavigateAndScroll('contacto')} className="hover:text-[#b89b71] transition">Contacto</button></li>
      </ul>
    </div>

    {/* Columna 3 */}
    <div className="flex flex-col gap-4 items-center lg:items-start max-w-[400px] w-full">
      <h4 className="text-base 3xl:text-lg font-semibold uppercase tracking-wide">Contacto</h4>
      <p className="text-sm 3xl:text-base">jesusaguilarpsicologia@gmail.com</p>
      <p className="text-sm 3xl:text-base">+34 601 416 889</p>
      <div className="flex gap-4 text-xl mt-1">
        <a href="https://wa.me/34601416889" target="_blank" rel="noopener noreferrer" className="hover:text-[#b89b71] transition" aria-label="WhatsApp"><FaWhatsapp /></a>
        <a href="https://www.instagram.com/psicologia_aguilar" target="_blank" rel="noopener noreferrer" className="hover:text-[#b89b71] transition" aria-label="Instagram"><FaInstagram /></a>
      </div>
    </div>
  </div>

  <div className="text-center text-xs 3xl:text-sm text-gray-600 mt-10 relative">
    &copy; {new Date().getFullYear()} Jesús Aguilar · Todos los derechos reservados.
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="absolute right-6 top-0 text-[#141413] hover:text-[#9e855c] transition"
      aria-label="Volver arriba"
    >
      <FaArrowUp />
    </a>
  </div>
</footer>
  );
};

export default Footer;

