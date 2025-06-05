import React from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
     <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
