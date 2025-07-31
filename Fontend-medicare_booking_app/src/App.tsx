import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/register";
import { useCurrentApp } from "./components/contexts/app.context";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import NotFoundPage from "./components/common/error";
import DoctorProtectedRoute from "./components/auth/DoctorProtectedRoute";
import DoctorRoutes from "./routes/DoctorRoutes";

function App() {
  const { user } = useCurrentApp();
  return (
    <Routes>
      {/* public */}
      <Route
        path="/"
        element={
          <h1>Welcome to the Medicare Booking App! {JSON.stringify(user)}</h1>
        }
      />

      {/* auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* admin */}
      <Route
        path="admin/*"
        element={
          <AdminProtectedRoute>
            <AdminRoutes />
          </AdminProtectedRoute>
        }
      />

      {/* doctor */}
      <Route
        path="doctor/*"
        element={
          <DoctorProtectedRoute>
            <DoctorRoutes />
          </DoctorProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
