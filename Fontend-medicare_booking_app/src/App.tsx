import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/register";

function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<h1>Welcome to the Medicare Booking App!</h1>} />

      {/* auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* admin */}
      <Route path="admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App;
