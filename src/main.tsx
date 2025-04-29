// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import RouteMain from "./router/Routemain";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouteMain />
  </React.StrictMode>
);

