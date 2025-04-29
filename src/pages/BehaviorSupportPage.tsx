import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BehaviorSupportSection from "../components/BehaviorSupportSection";
import ContactSection from "../components/ContactSection";

const BehaviorSupportPage = () => {
  return (
    <main className="bg-beige-100 min-h-screen">
      <Header />

      <BehaviorSupportSection />
      <ContactSection/>
      <Footer />
    </main>
  );
};

export default BehaviorSupportPage;
