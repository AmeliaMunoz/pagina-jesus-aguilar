// src/router/RouteMain.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AboutMePage from "../pages/AboutMePage";
import FamilySupportPage from "../pages/FamilySupportPage";
import BehaviorSupportPage   from "../pages/BehaviorSupportPage";
import AdolescentTherapyPage from "../pages/AdolescentTherapyPage";
import Admin from "../pages/Admin";
import PatientHistory from "../pages/PatientHistory";
import Configuration from "../pages/Configuration";
import ScrollToTop from "../components/ScrollToTop";
import AppointmentStatsPage from "../pages/AppointmentStatePage";
import AdminAppointmentsPage from "../pages/AdminAppointmentsPage";
import MessagePage from "../pages/MessagePage";



const RouteMain = () => {
  return (
    <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutMePage />} />
      <Route path="/acompanamiento-familiar" element={<FamilySupportPage />} />
      <Route path="/intervencion-conducta" element={<BehaviorSupportPage />} />
      <Route path="/terapia-adolescente" element={<AdolescentTherapyPage />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/pacientes" element={<PatientHistory />} />
      <Route path="/admin/configuracion" element={<Configuration />} />
      <Route path="/admin/estadisticas" element={<AppointmentStatsPage />} />
      <Route path="/admin/citas" element={<AdminAppointmentsPage />} />
      <Route path="/admin/mensajes"element={<MessagePage />} />
    </Routes>
    </BrowserRouter>
  );
};






export default RouteMain;

