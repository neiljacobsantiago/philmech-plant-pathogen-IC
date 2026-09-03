import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "../css/style.css"; // Imports the baseline styles for avatar, cards, and buttons

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);