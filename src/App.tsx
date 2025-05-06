import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth"; 
import LoginPage from "./pages/LoginPage";
import Admin from "./pages/Admin"; 
import User from "./pages/User";

function App() {
  const [user, setUser] = useState<any>(null);

  // Comprobar el estado de autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);  // Si el usuario está autenticado, guardamos su información
      } else {
        setUser(null);  // Si no está autenticado, lo dejamos en null
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <User /> : <LoginPage />} /> 
        <Route path="/login" element={<LoginPage />} />  
        <Route path="/profile" element={user ? <User /> : <LoginPage />} />
        <Route path="/admin" element={user ? <Admin /> : <LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;









