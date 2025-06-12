import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { LoginProvider } from "./LoginProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoginProvider>
      <App />
    </LoginProvider>
  </React.StrictMode>
);
