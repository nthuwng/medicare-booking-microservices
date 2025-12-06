import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const LayoutAdmin = lazy(() => import("../components/layout/AdminLayout/layout.admin"));
const AdminDashboardPage = lazy(() => import("../modules/admin/pages/AdminDashboardPage"));
const DoctorManagementPage = lazy(() => import("../modules/admin/pages/DoctorManagementPage"));
const SpecialitiesManagementPage = lazy(() => import("../modules/admin/pages/SpecialitiesManagementPage"));
const NotFoundPage = lazy(() => import("@/components/common/error"));
const ClinicManagementPage = lazy(() => import("@/modules/admin/pages/ClinicManagementPage"));
const AccountManagementPage = lazy(() => import("@/modules/admin/pages/AccountManagementPage"));
const AdminManagementPage = lazy(() => import("@/modules/admin/pages/AdminManagementPage"));
const PatientManagementPage = lazy(() => import("@/modules/admin/pages/PatientManagementPage"));
const TimeSlotManagementPage = lazy(() => import("@/modules/admin/pages/TimeSlotManagementPage"));
const AdminRoutes = () => {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
      <Routes>
      <Route path="/" element={<LayoutAdmin />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="admin-management" element={<AdminManagementPage />} />
        <Route path="doctor-management" element={<DoctorManagementPage />} />
        <Route path="patient-management" element={<PatientManagementPage />} />
        <Route path="specialities" element={<SpecialitiesManagementPage />} />
        <Route path="clinic" element={<ClinicManagementPage />} />
        <Route path="account-management" element={<AccountManagementPage />} />
        <Route
          path="time-slot-management"
          element={<TimeSlotManagementPage />}
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
