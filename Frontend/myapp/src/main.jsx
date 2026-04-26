import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './styles/global.css'
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1093735082843-e129butibp94v11ishl24hiddrs9uhag.apps.googleusercontent.com">
    <SearchProvider>
    <BrowserRouter>
      <AuthProvider>
      <App />
      </AuthProvider>
    </BrowserRouter>
    </SearchProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
