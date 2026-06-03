import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1093735082843-e129butibp94v11ishl24hiddrs9uhag.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
