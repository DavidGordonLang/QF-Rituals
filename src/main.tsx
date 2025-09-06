import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/tailwind.css";
import "./suiteBus.ts"; // <-- Suite Bridge

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
