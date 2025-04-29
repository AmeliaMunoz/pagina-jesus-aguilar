import React from "react";
import FamilySupportSection from "../components/FamilySupportSection";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactSection from "../components/ContactSection";

const FamilySupportPage = () => {
  return (
    <main className="bg-beige-100 min-h-screen">
      <Header />

      <FamilySupportSection />
      <ContactSection/>
      <Footer />
    </main>
  );
};

export default FamilySupportPage;
