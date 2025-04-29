import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

import ContactSection from "../components/ContactSection";
import AdolescentTherapySection from "../components/AdolescentTherapySection";

const AdolescentTherapyPage = () => {
  return (
    <main className="bg-beige-100 min-h-screen">
      <Header />

      <AdolescentTherapySection />
      <ContactSection/>

      <Footer />
    </main>
  );
};

export default AdolescentTherapyPage;