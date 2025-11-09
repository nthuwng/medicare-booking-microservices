import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Award, Shield } from "lucide-react";
import Banner from "../components/Banner/Banner";
import DoctorCarousel from "../components/Banner/DoctorCarousel";
import BookingOptions from "../components/BookingOptions/BookingOptions";
import { useCurrentApp } from "@/components/contexts/app.context";

type Mode = "light" | "dark";

// Cho phép các thuộc tính tên dạng --something
type CSSVarName = `--${string}`;
type CSSWithVars = React.CSSProperties & Record<CSSVarName, string>;

const TOKENS: Record<Mode, CSSWithVars> = {
  light: {
    "--bg": "#f6faff",
    "--surface": "#ffffff",
    "--text": "#0f172a",
    "--muted": "#64748b",
    "--border": "#e2e8f0",
    "--primary": "#2563eb",
    "--primary-600": "#1d4ed8",
    "--shadow": "0 10px 30px rgba(0,0,0,0.06)",
  },
  dark: {
    "--bg": "#0D1224",
    "--surface": "#0e172a",
    "--text": "#e2e8f0",
    "--muted": "#94a3b8",
    "--border": "#1f2937",
    "--primary": "#60a5fa",
    "--primary-600": "#3b82f6",
    "--shadow": "0 10px 30px rgba(0,0,0,0.35)",
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { theme } = useCurrentApp();

  const tokens = TOKENS[theme];

  const stats = useMemo(
    () => [
      {
        icon: <Users className="h-10 w-10 text-[var(--primary)]" />,
        number: "50,000+",
        label: "Bệnh nhân tin tưởng",
      },
      {
        icon: <Clock className="h-10 w-10 text-emerald-500" />,
        number: "24/7",
        label: "Hỗ trợ khẩn cấp",
      },
      {
        icon: <Award className="h-10 w-10 text-amber-500" />,
        number: "200+",
        label: "Bác sĩ chuyên môn",
      },
      {
        icon: <Shield className="h-10 w-10 text-purple-500" />,
        number: "99.9%",
        label: "Độ tin cậy",
      },
    ],
    []
  );

  const features = useMemo(
    () => [
      {
        title: "Đặt lịch trực tuyến",
        description: "Đặt lịch hẹn nhanh chóng, tiện lợi",
        icon: "📅",
      },
      {
        title: "Tư vấn từ xa",
        description: "Bác sĩ tư vấn thông qua video call",
        icon: "💻",
      },
      {
        title: "Hồ sơ điện tử",
        description: "Lưu trữ hồ sơ an toàn, bảo mật",
        icon: "📋",
      },
      {
        title: "Thanh toán trực tuyến",
        description: "Nhanh chóng, minh bạch, tiện lợi",
        icon: "💳",
      },
    ],
    []
  );

  return (
    <main
      style={tokens}
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
    >
      <Banner />

      {/* STATS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            MediCare – Nơi bạn tin tưởng
          </h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto mb-12">
            Chúng tôi mang đến dịch vụ y tế hiện đại, an toàn và chất lượng
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] hover:-translate-y-1 transition"
              >
                <div className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center bg-[var(--bg)] mb-4">
                  {item.icon}
                </div>
                <h3 className="text-3xl font-bold">{item.number}</h3>
                <p className="text-[var(--muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Tại sao chọn MediCare?
            </h2>
            <p className="mt-2 max-w-2xl mx-auto link-muted">
              Chúng tôi hướng đến trải nghiệm y tế tiện lợi – minh bạch – an
              toàn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[var(--surface)] rounded-2xl p-8 shadow-[var(--shadow)] border border-[var(--border)] text-center hover:-translate-y-1 transition"
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-[var(--muted)] mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DoctorCarousel />

      {/* FOR YOU */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Dành cho bạn
            </h2>
            <p className="mt-2 max-w-2xl mx-auto link-muted">
              Khám phá các dịch vụ nổi bật phù hợp với nhu cầu chăm sóc sức khỏe
              của bạn
            </p>
          </div>
          <BookingOptions />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--primary)]">
            Sẵn sàng đặt lịch khám?
          </h2>
          <p className="mt-2 text-[var(--muted)] max-w-2xl mx-auto">
            Đăng ký ngay để nhận ưu đãi và được hỗ trợ tốt nhất
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-10 justify-center">
            <button
              onClick={() => navigate("/booking-options")}
              className="cursor-pointer bg-[var(--primary)] text-white px-10 py-4 rounded-full font-bold hover:bg-[var(--primary-600)] shadow-[var(--shadow)] transition"
            >
              Đặt lịch miễn phí
            </button>
            <button className="cursor-pointer border border-[var(--primary)] text-[var(--primary)] px-10 py-4 rounded-full font-bold hover:bg-[var(--primary)] hover:text-white transition">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
