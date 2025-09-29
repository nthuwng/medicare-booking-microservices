import NotFoundPage from "@/components/common/error";
import LayoutClient from "@/components/layout/ClientLayout/layout.client";
import BookingPage from "@/modules/client/pages/booking/BookingPage";
import ClinicBookingPage from "@/modules/client/pages/booking/ClinicBookingPage";
import DoctorBookingPage from "@/modules/client/pages/booking/DoctorBookingPage";

import HomePage from "@/modules/client/pages/HomePage";
import SpecialtyBookingPage from "@/modules/client/pages/booking/SpecialtyBookingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/register";
import { Route, Routes } from "react-router-dom";
import DoctorDetailPage from "@/modules/client/pages/doctor/DoctorDetailPage";
import MakeAppointmentPage from "@/modules/client/pages/booking/MakeAppointmentPage";
import PaymentSelectionPage from "@/modules/client/pages/booking/PaymentSelectionPage";
import PaymentReturnPage from "@/modules/client/pages/booking/PaymentReturnPage";
import MessagePage from "@/modules/client/pages/MessagePage";
import MyAppointmentsPage from "@/modules/client/pages/appointments/MyAppointmentsPage";
import AppointmentDetailPage from "@/modules/client/pages/appointments/AppointmentDetailPage";
import MyAccountPage from "@/modules/client/pages/MyAccountPage";
import PatientProtectedRoute from "@/components/auth/PatientProtectedRoute";
import AboutPage from "@/modules/client/pages/AboutPage";
import LayoutAccount from "@/modules/client/components/LayoutAccount/LayoutAccount";

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/message/:doctorId" element={<MessagePage />} />

        <Route element={<LayoutAccount />}>
          <Route path="/my-appointments" element={<MyAppointmentsPage />} />
          <Route path="/message" element={<MessagePage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
        </Route>

        {/* Hình thức đặt lịch */}
        <Route
          path="/booking-options"
          element={
            <PatientProtectedRoute>
              <BookingPage />
            </PatientProtectedRoute>
          }
        />

        {/* Đặt lịch bác sĩ */}
        <Route
          path="/booking-options/doctor"
          element={
            <PatientProtectedRoute>
              {" "}
              <DoctorBookingPage />{" "}
            </PatientProtectedRoute>
          }
        />
        {/* Đặt lịch chuyên khoa */}
        <Route
          path="/booking-options/specialty"
          element={
            <PatientProtectedRoute>
              {" "}
              <SpecialtyBookingPage />{" "}
            </PatientProtectedRoute>
          }
        />

        {/* Đặt lịch cơ sở y tế */}
        <Route
          path="/booking-options/clinic"
          element={
            <PatientProtectedRoute>
              {" "}
              <ClinicBookingPage />{" "}
            </PatientProtectedRoute>
          }
        />

        {/* Chi tiết bác sĩ */}
        <Route
          path="/booking-options/doctor/:doctorId"
          element={<DoctorDetailPage />}
        />

        {/* Đặt lịch khám bệnh */}
        <Route
          path="/booking-options/doctor/:doctorId/appointment"
          element={<MakeAppointmentPage />}
        />

        {/* Trang chọn phương thức thanh toán */}
        <Route path="/payment-selection" element={<PaymentSelectionPage />} />

        {/* Trang kết quả thanh toán VNPay */}
        <Route path="/payment-return" element={<PaymentReturnPage />} />

        {/* Trang chi tiết lịch đã đặt */}
        <Route
          path="/appointment-detail/:id"
          element={<AppointmentDetailPage />}
        />

        {/* Trang about */}
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default ClientRoutes;
