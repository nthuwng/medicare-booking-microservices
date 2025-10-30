import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import NotFoundPage from "./components/common/error";
import DoctorProtectedRoute from "./components/auth/DoctorProtectedRoute";
import DoctorRoutes from "./routes/DoctorRoutes";
import ClientRoutes from "./routes/ClientRoutes";
import AIPage from "./modules/client/pages/AIPage";
import TopRateDoctors from "./modules/client/pages/TopRateDoctors";

function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/*" element={<ClientRoutes />} />

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

      {/* Trang AI */}
      <Route path="/ai" element={<AIPage />} />

      {/* coding */}
      <Route path="code/*" element={<TopRateDoctors />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
