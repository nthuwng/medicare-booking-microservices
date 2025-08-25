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

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Hình thức đặt lịch */}
        <Route path="/booking-options" element={<BookingPage />} />

        {/* Đặt lịch bác sĩ */}
        <Route path="/booking-options/doctor" element={<DoctorBookingPage />} />
        {/* Đặt lịch chuyên khoa */}
        <Route
          path="/booking-options/specialty"
          element={<SpecialtyBookingPage />}
        />
        {/* Đặt lịch cơ sở y tế */}
        <Route path="/booking-options/clinic" element={<ClinicBookingPage />} />

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
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default ClientRoutes;
