import { useEffect } from "react";
import Home from "./pages/Home";

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("admin-autenticado");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return <Home />;
}

export default App;


