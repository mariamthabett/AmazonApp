import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Router | اللغة | المستخدم | السلة | الإشعارات | المفضّلة */}
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
