import { Route, Routes } from "react-router-dom";
import NotFoundPage from "@/components/common/error";
import LayoutDoctor from "@/components/layout/DoctorLayout/layout.doctor";
import DoctorDashboardPage from "@/modules/doctor/pages/DoctorDashboardPage";
import DoctorProFileManagePage from "@/modules/doctor/pages/DoctorProFileManagePage";
import DoctorSchedulePage from "@/modules/doctor/pages/DoctorSchedulePage";
import DoctorAppointmentPage from "@/modules/doctor/pages/DoctorAppointmentPage";
import DoctorMessagePage from "@/modules/doctor/pages/DoctorMessagePage";
import DoctorRatingPage from "@/modules/doctor/pages/DoctorRatingPage";
import DoctorWaitingApproval from "@/modules/doctor/auth/DoctorWaitingApproval";
import DoctorChangePasswordPage from "@/modules/doctor/pages/DoctorChangePasswordPage";
import WeeklyWorkSchedule from "@/modules/doctor/pages/WeeklyWorkSchedule";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutDoctor />}>
        <Route
          index
          element={
            <DoctorWaitingApproval>
              <DoctorDashboardPage />
            </DoctorWaitingApproval>
          }
        />

        <Route
          path="schedule"
          element={
            <DoctorWaitingApproval>
              <DoctorSchedulePage />
            </DoctorWaitingApproval>
          }
        />
        <Route
          path="appointments"
          element={
            <DoctorWaitingApproval>
              <DoctorAppointmentPage />
            </DoctorWaitingApproval>
          }
        />
        <Route
          path="messages"
          element={
            <DoctorWaitingApproval>
              <DoctorMessagePage />
            </DoctorWaitingApproval>
          }
        />
        <Route
          path="ratings"
          element={
            <DoctorWaitingApproval>
              <DoctorRatingPage />
            </DoctorWaitingApproval>
          }
        />

        <Route
          path="weekly-work-schedule"
          element={
            <DoctorWaitingApproval>
              <WeeklyWorkSchedule />
            </DoctorWaitingApproval>
          }
        />

        <Route path="profile-settings" element={<DoctorProFileManagePage />} />
        <Route path="change-password" element={<DoctorChangePasswordPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default DoctorRoutes;
