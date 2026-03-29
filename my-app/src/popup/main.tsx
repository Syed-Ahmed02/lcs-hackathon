import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { PopupRoot } from "./PopupRoot.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopupRoot />
  </StrictMode>,
);

export { PopupRoot };
