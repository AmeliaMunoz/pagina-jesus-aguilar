import Header from "../components/layout/Header";
import Hero from "../components/sections/Hero";
import AboutMe from "../components/sections/Aboutme";
import TherapyTypes from "../components/sections/TherapyTypes";
import ContactSection from "../components/sections/ContactSection";
import Footer from "../components/layout/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Home = () => {
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
      <main className="w-full bg-[#fdf8f4] px-4 sm:px-6 2xl:px-20 3xl:px-32 pt-8 space-y-32">
        <Header />
        <Hero/>
        <AboutMe />
        <TherapyTypes />
        <ContactSection />
      </main>
      
      <Footer />
    </>
  );
};

export default Home;



