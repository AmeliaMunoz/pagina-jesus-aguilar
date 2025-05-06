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
import UserCreatePage from "../pages/UserCreatePage";
import CrearCitaManual from "../pages/CrearCitasManual";
import User from "../pages/User";
import LoginPage from "../pages/LoginPage";



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
      <Route path="/admin/crear-usuario" element={<UserCreatePage/>} />
      <Route path="/admin/crear-cita" element={<CrearCitaManual />} />  
      <Route path="/usuario" element={<User/>} />
      <Route path="/login" element={<LoginPage />} /> 
      <Route path="/profile" element={User ? <User /> : <LoginPage />} />

    </Routes>
    </BrowserRouter>
  );
};






export default RouteMain;

