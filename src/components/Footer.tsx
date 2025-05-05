import { FaInstagram, FaWhatsapp, FaArrowUp } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './IconoLogo';

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
    <footer className="bg-[#e8d4c3d5] text-gray-800 py-12 mt-0">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

        <div className="flex flex-col gap-4 items-start">
          <Logo className="w-20 h-20 mb-2" />
          <p className="text-sm text-gray-600">
            Psicología centrada en el bienestar emocional de adolescentes y familias.
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-4 uppercase tracking-wide">Navegación</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => handleNavigateAndScroll()}
                className="hover:text-[#b89b71] transition"
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigateAndScroll('terapias')}
                className="hover:text-[#b89b71] transition"
              >
                Terapias
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigateAndScroll('sobre-mi')}
                className="hover:text-[#b89b71] transition"
              >
                Sobre mí
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigateAndScroll('contacto')}
                className="hover:text-[#b89b71] transition"
              >
                Contacto
              </button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold uppercase tracking-wide">Contacto</h4>
          <p className="text-sm">jesusaguilarpsicologia@gmail.com</p>
          <p className="text-sm">+34 123 456 789</p>
          <div className="flex gap-4 mt-2 text-xl">
            <a
              href="https://wa.me/34123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#b89b71] transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://www.instagram.com/psicologia_aguilar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#b89b71] transition"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-10 relative px-6">
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




  