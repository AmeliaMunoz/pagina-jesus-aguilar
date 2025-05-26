import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./IconoLogo";
import { Menu } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <header className="bg-[#fdf8f4] py-4 px-4 sm:px-6 2xl:px-20 3xl:px-32 sticky top-0 z-50">
      <div className="max-w-[2560px] mx-auto flex items-center justify-between relative">
        
        <div className="flex-1 flex justify-start md:justify-center items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <Logo className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="absolute right-0 flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-800 text-2xl"
            aria-label="Abrir menú"
          >
            <Menu size={28} />
          </button>
        </div>

        <div className="hidden lg:flex justify-between items-center w-full absolute top-1/2 -translate-y-1/2 px-6 3xl:px-12">
          <ul className="flex gap-6 3xl:gap-10 text-base 3xl:text-2xl font-medium text-gray-800 uppercase tracking-wide">
            <li className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer hover:text-[#b89b71] transition"
              >
                TERAPIAS
              </button>
              {dropdownOpen && (
                <ul className="absolute top-full left-0 mt-2 bg-white text-gray-800 shadow-md rounded-md p-2 z-10 text-left min-w-[200px] text-sm 3xl:text-base normal-case font-normal">
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link to="/terapia-adolescente" onClick={closeDropdown}>Terapia adolescente</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link to="/acompanamiento-familiar" onClick={closeDropdown}>Acompañamiento familiar</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100">
                    <Link to="/intervencion-conducta" onClick={closeDropdown}>Intervención en conducta</Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link to="/about" className="hover:text-[#b89b71] transition">Sobre mí</Link>
            </li>
          </ul>

          <ul className="flex gap-6 3xl:gap-10 text-base 3xl:text-2xl font-medium text-gray-800 uppercase tracking-wide">
            <li>
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-[#b89b71] transition"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/#contacto" className="hover:text-[#b89b71] transition">
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 px-4 py-2 space-y-2 text-base font-medium text-gray-800 uppercase tracking-wide divide-y divide-gray-300">
          <button className="w-full text-left py-2">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-[#b89b71] transition"
            >
              Inicio
            </Link>
          </button>

          <button className="w-full text-left py-2">
            <Link to="/about" className="hover:text-[#b89b71] transition">
              Sobre mí
            </Link>
          </button>

          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full text-left py-2"
            >
              Terapias
            </button>
            {dropdownOpen && (
              <ul className="pl-4 space-y-2 text-sm 3xl:text-base normal-case">
                <li>
                  <Link to="/terapia-adolescente" onClick={closeDropdown}>Terapia adolescente</Link>
                </li>
                <li>
                  <Link to="/acompanamiento-familiar" onClick={closeDropdown}>Acompañamiento familiar</Link>
                </li>
                <li>
                  <Link to="/intervencion-conducta" onClick={closeDropdown}>Intervención en conducta</Link>
                </li>
              </ul>
            )}
          </div>

          <button className="w-full text-left py-2">
            <Link to="/#contacto" className="hover:text-[#b89b71] transition">
              Contacto
            </Link>
          </button>

          <div className="pt-6 mt-6 border-t-2 border-dashed border-[#d8c2ab] text-center text-sm text-gray-500">
            <div className="flex justify-center gap-5 text-xl text-gray-700 mb-3">
              <a
                href="mailto:jesusaguilarpsicologia@gmail.com"
                className="hover:text-[#b89b71]"
                aria-label="Correo"
              >
                <FaEnvelope />
              </a>
              <a
                href="https://wa.me/34123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#b89b71]"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
              <a
                href="https://www.instagram.com/psicologia_aguilar"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#b89b71]"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
            <p className="text-[11px] text-gray-500 tracking-wide">
              &copy; {new Date().getFullYear()} jesús aguilar
            </p>
            <p className="text-[11px] text-gray-500 tracking-wide">
              <span className="not-italic">T</span>
              <span className="lowercase">odos los derechos reservados</span>
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

























