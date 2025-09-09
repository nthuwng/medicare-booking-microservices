import { Route, Routes } from "react-router-dom";
import NotFoundPage from "@/components/common/error";
import LayoutDoctor from "@/components/layout/DoctorLayout/layout.doctor";
import DoctorDashboardPage from "@/modules/doctor/pages/DoctorDashboardPage";
import DoctorProFileManagePage from "@/modules/doctor/pages/DoctorProFileManagePage";
import DoctorSchedulePage from "@/modules/doctor/pages/DoctorSchedulePage";
import DoctorAppointmentPage from "@/modules/doctor/pages/DoctorAppointmentPage";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutDoctor />}>
        <Route index element={<DoctorDashboardPage />} />
        <Route path="profile-settings" element={<DoctorProFileManagePage />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
        <Route path="appointments" element={<DoctorAppointmentPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default DoctorRoutes;
