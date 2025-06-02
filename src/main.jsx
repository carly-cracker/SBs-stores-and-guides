import { createRoot } from 'react-dom/client'
import React from "react";
import ReactDOM from "react-dom/client";
import './App.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CartProvider>
  </React.StrictMode>
)
