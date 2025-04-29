import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./IconoLogo";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeDropdown = () => setDropdownOpen(false);

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <header className="bg-[#fdf8f4] py-4 px-6 relative z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
        {/* Logo */}
        <div className="flex-1 flex justify-start md:justify-center items-center">
          <button
            onClick={handleLogoClick}
            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center"
          >
            <Logo className="w-full h-full" />
          </button>
        </div>

        {/* Botón hamburguesa en móvil y tablet */}
        <div className="absolute right-0 flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-800 text-2xl"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>

        {/* Menú escritorio */}
        <div className="hidden lg:flex justify-between items-center w-full absolute top-1/2 -translate-y-1/2 px-6">
          {/* Menú izquierdo */}
          <ul className="flex gap-6 text-base font-medium text-gray-800 uppercase tracking-wide">
            <li className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer hover:text-[#b89b71] transition"
              >
                TERAPIAS
              </button>

              {dropdownOpen && (
                <ul className="absolute top-full left-0 mt-2 bg-white text-gray-800 shadow-md rounded-md p-2 z-10 text-left min-w-[200px] text-sm normal-case font-normal">
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
              <Link to="/about" className="hover:text-[#b89b71] transition">
                Sobre mí
              </Link>
            </li>
          </ul>

          {/* Menú derecho */}
          <ul className="flex gap-6 text-base font-medium text-gray-800 uppercase tracking-wide">
            <li>
              <Link to="/" className="hover:text-[#b89b71] transition">
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

      {/* Menú móvil/tablet */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 px-4 py-2 space-y-2 text-base font-medium text-gray-800 uppercase tracking-wide divide-y divide-gray-300">
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full text-left py-2"
            >
              Terapias
            </button>
            {dropdownOpen && (
              <ul className="pl-4 space-y-2 text-sm normal-case">
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
            <Link to="/about">Sobre mí</Link>
          </button>
          <button className="w-full text-left py-2">
            <Link to="/">Inicio</Link>
          </button>
          <button className="w-full text-left py-2">
            <Link to="/#contacto">Contacto</Link>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;















