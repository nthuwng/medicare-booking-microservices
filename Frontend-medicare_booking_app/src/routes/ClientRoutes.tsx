import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PatientProtectedRoute from "@/components/auth/PatientProtectedRoute";

const NotFoundPage = lazy(() => import("@/components/common/error"));
const LayoutClient = lazy(() => import("@/components/layout/ClientLayout/layout.client"));
const LayoutAccount = lazy(() => import("@/modules/client/components/LayoutAccount/LayoutAccount"));

const HomePage = lazy(() => import("@/modules/client/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Register"));
const BookingPage = lazy(() => import("@/modules/client/pages/booking/BookingPage"));
const ClinicBookingPage = lazy(() => import("@/modules/client/pages/booking/ClinicBookingPage"));
const DoctorBookingPage = lazy(() => import("@/modules/client/pages/booking/DoctorBookingPage"));
const SpecialtyBookingPage = lazy(() => import("@/modules/client/pages/booking/SpecialtyBookingPage"));
const DoctorDetailPage = lazy(() => import("@/modules/client/pages/doctor/DoctorDetailPage"));
const MakeAppointmentPage = lazy(() => import("@/modules/client/pages/booking/MakeAppointmentPage"));
const PaymentSelectionPage = lazy(() => import("@/modules/client/pages/booking/PaymentSelectionPage"));
const PaymentReturnPage = lazy(() => import("@/modules/client/pages/booking/PaymentReturnPage"));
const CashPaymentSuccessPage = lazy(() => import("@/modules/client/pages/booking/CashPaymentSuccessPage"));
const MessagePage = lazy(() => import("@/modules/client/pages/MessagePage"));
const MyAppointmentsPage = lazy(() => import("@/modules/client/pages/appointments/MyAppointmentsPage"));
const AppointmentDetailPage = lazy(() => import("@/modules/client/pages/appointments/AppointmentDetailPage"));
const MyAccountPage = lazy(() => import("@/modules/client/pages/MyAccountPage"));
const AboutPage = lazy(() => import("@/modules/client/pages/AboutPage"));
const TopRateDoctors = lazy(() => import("@/modules/client/pages/TopRateDoctors"));
const ContactPartnerPage = lazy(() => import("@/modules/client/pages/ContactPartnerPage"));
const ForgotPassword = lazy(() => import("@/modules/client/pages/ForgotPassword"));

const ClientRoutes = () => {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
      <Routes>
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<LayoutAccount />}>
          <Route path="/my-appointments" element={<MyAppointmentsPage />} />
          <Route path="/message" element={<MessagePage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
          <Route path="/message/:doctorId" element={<MessagePage />} />
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

        {/* Trang thành công thanh toán tiền mặt */}
        <Route
          path="/cash-payment-success"
          element={<CashPaymentSuccessPage />}
        />

        {/* Trang chi tiết lịch đã đặt */}
        <Route
          path="/appointment-detail/:id"
          element={<AppointmentDetailPage />}
        />

        {/* Trang about */}
        <Route path="/about" element={<AboutPage />} />

        {/* Liên hệ hợp tác */}
        <Route path="/contact" element={<ContactPartnerPage />} />

        {/* Bác sĩ được đánh giá cao */}
        <Route path="/top-rate-doctors" element={<TopRateDoctors />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default ClientRoutes;
