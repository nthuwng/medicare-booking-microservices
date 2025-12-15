import LayoutAdmin from "../components/layout/AdminLayout/layout.admin";
import { Route, Routes } from "react-router-dom";
import AdminDashboardPage from "../modules/admin/pages/AdminDashboardPage";
import DoctorManagementPage from "../modules/admin/pages/DoctorManagementPage";
import SpecialitiesManagementPage from "../modules/admin/pages/SpecialitiesManagementPage";
import NotFoundPage from "@/components/common/error";
import ClinicManagementPage from "@/modules/admin/pages/ClinicManagementPage";
import AccountManagementPage from "@/modules/admin/pages/AccountManagementPage";
import AdminManagementPage from "@/modules/admin/pages/AdminManagementPage";
import PatientManagementPage from "@/modules/admin/pages/PatientManagementPage";
import TimeSlotManagementPage from "@/modules/admin/pages/TimeSlotManagementPage";
import PaymentManagementPage from "@/modules/admin/pages/PaymentManagementPage";
const AdminRoutes = () => {
  return (
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
        <Route path="payment-management" element={<PaymentManagementPage />} />

      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AdminRoutes;
