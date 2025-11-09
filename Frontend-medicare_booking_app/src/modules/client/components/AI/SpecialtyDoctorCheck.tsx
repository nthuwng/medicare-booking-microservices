// SpecialtyDoctorCheck.tsx
import type { IAiSpecialtyDoctorCheck } from "@/types";
import {
  UserOutlined,
  PhoneOutlined,
  StarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCurrentApp } from "@/components/contexts/app.context";

interface Props {
  text: string | null;
  data: IAiSpecialtyDoctorCheck | null;
  onFindDoctors?: (specialtyName: string) => void;
}

/* Palette khớp các trang khác */
const palette = {
  dark: {
    pageBg: "#0D1224",
    surface: "#0f1b2d",
    surface2: "#152238",
    border: "rgba(255,255,255,0.10)",
    borderSoft: "rgba(255,255,255,0.08)",
    text: "#ffffff",
    textMuted: "#cbd5e1",
    textSoft: "#94a3b8",
    primary: "#60a5fa",
    primarySoft: "rgba(96,165,250,0.15)",
    bubbleUser: "#1b2b44",
  },
  light: {
    pageBg: "#F5F7FA",
    surface: "#ffffff",
    surface2: "#ffffff",
    border: "#e5e7eb",
    borderSoft: "#eef2ff",
    text: "#0f172a",
    textMuted: "#475569",
    textSoft: "#6b7280",
    primary: "#1677ff",
    primarySoft: "#eff6ff",
    bubbleUser: "#eff6ff",
  },
};

const cls = (...x: (string | false | undefined)[]) => x.filter(Boolean).join(" ");

const SpecialtyDoctorCheck = (props: Props) => {
  const { data } = props;
  const navigate = useNavigate();
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";
  const C = isDark ? palette.dark : palette.light;

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div
        className="p-6 rounded-lg"
        style={{ background: isDark ? C.surface2 : "#f9fafb", border: `1px solid ${C.border}` }}
      >
        <p className="text-center" style={{ color: isDark ? C.textSoft : "#6b7280" }}>
          Không tìm thấy bác sĩ
        </p>
      </div>
    );
  }

  const doctors = data.data;
  const specialtyName = doctors[0]?.specialty?.specialtyName || "Chuyên khoa";

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: isDark ? C.text : "#1f2937" }}
        >
          Bác sĩ chuyên khoa {specialtyName}
        </h2>
        <p style={{ color: isDark ? C.textMuted : "#4b5563" }}>
          Tìm thấy {doctors.length} bác sĩ tại {doctors[0]?.clinic?.clinicName}
        </p>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className={cls(
              "rounded-lg transition-shadow duration-200 overflow-hidden",
              "border"
            )}
            style={{
              background: C.surface,
              borderColor: C.border,
              boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {doctor.avatarUrl ? (
                    <img
                      src={doctor.avatarUrl}
                      alt={doctor.fullName}
                      className="w-20 h-20 rounded-full object-cover"
                      style={{ border: `2px solid ${isDark ? C.primarySoft : "#dbeafe"}` }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: isDark ? C.primarySoft : "#dbeafe",
                      }}
                    >
                      <UserOutlined
                        className="text-3xl"
                        style={{ color: isDark ? C.primary : "#2563eb" }}
                      />
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className="text-xl font-semibold"
                      style={{ color: isDark ? C.text : "#1f2937" }}
                    >
                      {doctor.title}. {doctor.fullName}
                    </h3>
                    {doctor.gender === "Male" && (
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          background: isDark ? "rgba(96,165,250,0.15)" : "#eff6ff",
                          color: isDark ? C.primary : "#1d4ed8",
                        }}
                      >
                        Nam
                      </span>
                    )}
                    {doctor.gender === "Female" && (
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          background: isDark ? "rgba(244,114,182,0.15)" : "#ffe4f1",
                          color: isDark ? "#f9a8d4" : "#be185d",
                        }}
                      >
                        Nữ
                      </span>
                    )}
                  </div>

                  <p
                    className="mb-3 line-clamp-2"
                    style={{ color: isDark ? C.textSoft : "#4b5563" }}
                  >
                    {doctor.bio}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Experience */}
                    <div
                      className="flex items-center gap-2"
                      style={{ color: isDark ? C.text : "#374151" }}
                    >
                      <StarOutlined style={{ color: isDark ? "#fbbf24" : "#f59e0b" }} />
                      <span>{doctor.experienceYears} năm kinh nghiệm</span>
                    </div>

                    {/* Booking Fee */}
                    <div
                      className="flex items-center gap-2"
                      style={{ color: isDark ? C.text : "#374151" }}
                    >
                      <DollarOutlined style={{ color: isDark ? "#34d399" : "#059669" }} />
                      <span
                        className="font-semibold"
                        style={{ color: isDark ? "#34d399" : "#059669" }}
                      >
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(doctor.bookingFee))}
                      </span>
                    </div>

                    {/* Phone */}
                    <div
                      className="flex items-center gap-2"
                      style={{ color: isDark ? C.text : "#374151" }}
                    >
                      <PhoneOutlined style={{ color: isDark ? C.primary : "#2563eb" }} />
                      <span>{doctor.phone}</span>
                    </div>

                    {/* Location */}
                    <div
                      className="flex items-center gap-2"
                      style={{ color: isDark ? C.text : "#374151" }}
                    >
                      <EnvironmentOutlined style={{ color: isDark ? "#f87171" : "#dc2626" }} />
                      <span>{doctor.clinic.district}</span>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: `1px solid ${isDark ? C.border : "#f3f4f6"}` }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex-shrink-0">
                        {doctor.clinic.iconPath && (
                          <img
                            src={doctor.clinic.iconPath}
                            alt={doctor.clinic.clinicName}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: isDark ? C.text : "#1f2937" }}
                        >
                          {doctor.clinic.clinicName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: isDark ? C.textSoft : "#6b7280" }}
                        >
                          {doctor.clinic.street}, {doctor.clinic.district}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div
                className="mt-4 pt-4"
                style={{ borderTop: `1px solid ${isDark ? C.border : "#f3f4f6"}` }}
              >
                <button
                  onClick={() =>
                    navigate(`/booking-options/doctor/${doctor.id}/appointment`)
                  }
                  className="w-full font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
                  style={{
                    background: isDark ? C.primary : "#2563eb",
                    color: "#fff",
                    boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  Đặt lịch khám
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clinic Description */}
      {doctors[0]?.clinic?.description && (
        <div
          className="mt-6 rounded-lg p-5 border"
          style={{
            background: isDark ? C.primarySoft : "#eff6ff",
            borderColor: isDark ? C.border : "#bfdbfe",
          }}
        >
          <h4
            className="font-semibold mb-2"
            style={{ color: isDark ? C.text : "#1f2937" }}
          >
            Về {doctors[0].clinic.clinicName}
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ color: isDark ? C.text : "#374151" }}
          >
            {doctors[0].clinic.description}
          </p>
          <div
            className="mt-3 flex items-center gap-2 text-sm"
            style={{ color: isDark ? C.text : "#4b5563" }}
          >
            <PhoneOutlined style={{ color: isDark ? C.primary : "#2563eb" }} />
            <span>Hotline: {doctors[0].clinic.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { SpecialtyDoctorCheck };
