import Header from "../components/Header";
import Hero from "../components/Hero";
import AboutMe from "../components/Aboutme";
import TherapyTypes from "../components/TherapyTypes";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
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
    <main className="space-y-32 bg-[#fdf8f4] px-6 pt-8">

      <Header />
      <Hero />
      <AboutMe />
      <TherapyTypes />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Home;
