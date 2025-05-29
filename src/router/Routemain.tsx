
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AboutMePage from "../pages/AboutMePage";
import FamilySupportPage from "../pages/FamilySupportPage";
import BehaviorSupportPage   from "../pages/BehaviorSupportPage";
import AdolescentTherapyPage from "../pages/AdolescentTherapyPage";
import Admin from "../pages/Admin";
import PatientHistory from "../pages/PatientHistoryAdmin";
import Configuration from "../pages/Configuration";
import ScrollToTop from "../components/layout/ScrollToTop";
import AppointmentStatsPage from "../pages/AppointmentStatePage";
import AdminAppointmentsPage from "../pages/AdminAppointmentsPage";
import UserCreatePage from "../pages/UserCreatePage";
import User from "../pages/User";
import LoginPage from "../pages/UserLoginPage";
import BookAppointmentPage from "../pages/BookAppointmentPage";
import NextAppointmentPage from "../pages/NextAppointmentPage";
import PatientHistoryPage from "../pages/PatientHistoryPage";
import PatientMessagesPage from "../pages/PatientMessagePage";
import AdminMessagesPage from "../pages/AdminMessageChatPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import FormMessagesPage from "../pages/FormMessagePage";
import AdminDeleteUsersPage from "../pages/AdminDeleteUsersPage";



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
      <Route path="/admin/mensajes"element={<FormMessagesPage />} />
      <Route path="/admin/crear-usuario" element={<UserCreatePage/>} />
      <Route path="/usuario" element={<User/>} />
      <Route path="/login" element={<LoginPage />} /> 
      <Route path="/profile" element={User ? <User /> : <LoginPage />} />
      <Route path="/panel/paciente/reservar" element={<BookAppointmentPage />} />
      <Route path="/panel/paciente/proxima-cita" element={<NextAppointmentPage />} />
      <Route path="/panel/paciente/historial" element={<PatientHistoryPage />} />
      <Route path="/panel/paciente/mensajes" element={<PatientMessagesPage />} />
      <Route path="/admin/mensajes-pacientes" element={<AdminMessagesPage />} />
      <Route path="/panel/paciente/user" element={<User />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/eliminar-usuarios" element={<AdminDeleteUsersPage />} />
    </Routes>
    </BrowserRouter>
  );
};

export default RouteMain;

