import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BehaviorSupportSection from "../components/sections/BehaviorSupportSection";
import ContactSection from "../components/sections/ContactSection";

const BehaviorSupportPage = () => {
  return (
    <main className="w-full bg-[#fdf8f4] px-4 sm:px-6 2xl:px-20 3xl:px-32 pt-8 space-y-32">
      <Header />
      <BehaviorSupportSection />
      <ContactSection/>
      <Footer />
    </main>
  );
};

export default BehaviorSupportPage;
