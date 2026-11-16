import React from "react";
import ReactDOM from "react-dom/client";
import LocaleProvider from "./locales/LocaleProvider";
import App from "./App";
import "./assets/styles/tailwind.css";
import "./assets/styles/theme.css";
import "./assets/styles/global.css";
import ThemeProvider from "./theme/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
