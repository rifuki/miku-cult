import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import "@mysten/dapp-kit/dist/index.css";

import App from "./App.tsx";
import AppProviders from "./providers/app-providers.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
