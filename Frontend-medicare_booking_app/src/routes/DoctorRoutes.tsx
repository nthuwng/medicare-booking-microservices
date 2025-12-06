import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const NotFoundPage = lazy(() => import("@/components/common/error"));
const LayoutDoctor = lazy(() => import("@/components/layout/DoctorLayout/layout.doctor"));
const DoctorDashboardPage = lazy(() => import("@/modules/doctor/pages/DoctorDashboardPage"));
const DoctorProFileManagePage = lazy(() => import("@/modules/doctor/pages/DoctorProFileManagePage"));
const DoctorSchedulePage = lazy(() => import("@/modules/doctor/pages/DoctorSchedulePage"));
const DoctorAppointmentPage = lazy(() => import("@/modules/doctor/pages/DoctorAppointmentPage"));
const DoctorMessagePage = lazy(() => import("@/modules/doctor/pages/DoctorMessagePage"));
const DoctorRatingPage = lazy(() => import("@/modules/doctor/pages/DoctorRatingPage"));
const DoctorWaitingApproval = lazy(() => import("@/modules/doctor/auth/DoctorWaitingApproval"));
const DoctorChangePasswordPage = lazy(() => import("@/modules/doctor/pages/DoctorChangePasswordPage"));
const WeeklyWorkSchedule = lazy(() => import("@/modules/doctor/pages/WeeklyWorkSchedule"));

const DoctorRoutes = () => {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
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
    </Suspense>
  );
};

export default DoctorRoutes;
