import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import "./index.css";

/* ===== AUTH GUARD ===== */
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/* login page */}
      <Route path="/login" element={<Login />} />

      {/* dashboard protected */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <App />
          </RequireAuth>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  </BrowserRouter>
);