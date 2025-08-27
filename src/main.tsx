import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";        // <-- make sure this import exists
import { App } from "./app/App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
