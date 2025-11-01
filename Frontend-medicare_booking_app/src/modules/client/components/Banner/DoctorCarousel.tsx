import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ITopRateDoctors } from "@/types/rating";
import { useNavigate } from "react-router-dom";
import { getTopRateDoctorsAPI } from "../../services/client.api";
import { useCurrentApp } from "@/components/contexts/app.context";

const PAGE_SIZE = 12;

function getDoctorsPerView(width: number) {
  if (width <= 640) return 1;
  if (width <= 1024) return 2;
  if (width <= 1280) return 3;
  return 4;
}

const buildAvatarUrl = (url?: string, size?: number) => {
  if (!url) return "/Logo/LOGO_MEDICARE.png";
  return url;
};

const DoctorCarousel = () => {
  const { theme } = useCurrentApp();
  const [doctors, setDoctors] = useState<ITopRateDoctors[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doctorsPerView, setDoctorsPerView] = useState(
    typeof window !== "undefined" ? getDoctorsPerView(window.innerWidth) : 3
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () =>
      setDoctorsPerView(getDoctorsPerView(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTopRateDoctorsAPI(1, PAGE_SIZE);
        if (res?.data?.result) setDoctors(res.data.result);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handlePrev = () => {
    if (!doctors.length) return;
    setCurrentIndex(
      (prev) => (prev - doctorsPerView + doctors.length) % doctors.length
    );
  };
  const handleNext = () => {
    if (!doctors.length) return;
    setCurrentIndex((prev) => (prev + doctorsPerView) % doctors.length);
  };

  const visibleDoctors = useMemo(() => {
    if (doctors.length <= doctorsPerView) return doctors;
    const end = currentIndex + doctorsPerView;
    return end <= doctors.length
      ? doctors.slice(currentIndex, end)
      : [
          ...doctors.slice(currentIndex),
          ...doctors.slice(0, end - doctors.length),
        ];
  }, [doctors, doctorsPerView, currentIndex]);

  const avatarSize = useMemo(() => {
    if (doctorsPerView === 1) return "w-40 h-40 md:w-44 md:h-44";
    if (doctorsPerView === 2) return "w-36 h-36 md:w-40 md:h-40";
    if (doctorsPerView === 3) return "w-32 h-32 md:w-36 md:h-36";
    return "w-28 h-28 md:w-32 md:h-32";
  }, [doctorsPerView]);

  const itemWidth = useMemo(() => {
    if (doctorsPerView === 1) return "w-full max-w-lg";
    if (doctorsPerView === 2) return "w-[22rem]";
    if (doctorsPerView === 3) return "w-[20rem] md:w-[22rem]";
    return "w-[16.5rem] md:w-[18rem]";
  }, [doctorsPerView]);

  const avatarPx = useMemo(() => {
    if (doctorsPerView === 1) return 176;
    if (doctorsPerView === 2) return 160;
    if (doctorsPerView === 3) return 144;
    return 128;
  }, [doctorsPerView]);

  return (
    <section
      className={`
        w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16
        transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-[#0D1224]"
            : "bg-gradient-to-r from-[#f8fbff] via-white to-[#fff5f7]"
        }
      `}
    >
      <div className="relative py-10 md:py-14 px-3 md:px-4">
        <h2
          className={`
            text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-4
            ${theme === "dark" ? "text-white" : "text-gray-900"}
          `}
        >
          Bác sĩ nổi bật
        </h2>

        {doctors.length === 0 ? (
          <div
            className={`
              min-h-[140px] flex items-center justify-center
              ${theme === "dark" ? "text-gray-400" : "text-gray-500"}
            `}
          >
            Đang tải hoặc chưa có dữ liệu hiển thị.
          </div>
        ) : (
          <div className="relative max-w-7xl mx-auto">
            <div
              className={`
              absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full shadow flex items-center justify-center
              transition
              ${
                theme === "dark"
                  ? " text-black hover:text-white cursor-pointer hover:bg-black bg-white/80"
                  : " text-black hover:text-white cursor-pointer hover:bg-gray-900 bg-white/80 border border-gray-200"
              }
            `}
            >
              <button
                aria-label="Prev"
                onClick={handlePrev}
                disabled={doctors.length <= doctorsPerView}
              >
                <ChevronLeft className="w-6 h-6 cursor-pointer" />
              </button>
            </div>

            <div className="flex items-stretch justify-center gap-5 md:gap-7 px-6 md:px-10 select-none">
              {visibleDoctors.map((doc, idx) => {
                const avatarUrl = buildAvatarUrl(
                  doc.doctorProfile.avatarUrl,
                  avatarPx * 2
                );
                return (
                  <div
                    key={`${doc.doctorId}-${idx}`}
                    onClick={() =>
                      navigate(`/booking-options/doctor/${doc.doctorId}`)
                    }
                    className={`
                      group ${itemWidth} cursor-pointer p-6 rounded-2xl transition-all duration-300
                      shadow-lg hover:shadow-2xl hover:-translate-y-1 border
                      ${
                        theme === "dark"
                          ? "bg-[#0f1b2d] border-white/10"
                          : "bg-white border-gray-100"
                      }
                    `}
                  >
                    <div
                      className={`
                        mx-auto ${avatarSize} rounded-full overflow-hidden ring-offset-2
                        transition-all group-hover:ring-blue-300 ring-2
                        ${
                          theme === "dark"
                            ? "ring-blue-400/50 ring-offset-[#0f1b2d]"
                            : "ring-blue-200 ring-offset-white"
                        }
                      `}
                    >
                      <img
                        src={avatarUrl}
                        alt={doc.doctorProfile.fullName}
                        className="w-full h-full object-cover select-none"
                        width={avatarPx}
                        height={avatarPx}
                        loading={idx < doctorsPerView ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </div>

                    <h3
                      className={`
                        mt-3 text-center font-semibold text-[17px] md:text-lg line-clamp-1
                        ${theme === "dark" ? "text-white" : "text-gray-900"}
                      `}
                    >
                      {doc.doctorProfile.title} {doc.doctorProfile.fullName}
                    </h3>

                    <p
                      className={`
                        text-center text-sm md:text-base line-clamp-1
                        ${
                          theme === "dark"
                            ? "text-blue-300"
                            : "text-blue-700/80"
                        }
                      `}
                    >
                      {doc.doctorProfile.specialty?.specialtyName ||
                        "Không rõ chuyên khoa"}
                    </p>

                    <div
                      className={`
                        mt-2 flex items-center justify-center gap-1 font-bold
                        ${
                          theme === "dark"
                            ? "text-yellow-400"
                            : "text-yellow-500"
                        }
                      `}
                    >
                      <span>★</span>
                      <span>{Number(doc.avgScore).toFixed(1)}</span>
                    </div>

                    <p
                      className={`
                        text-center text-xs
                        ${theme === "dark" ? "text-gray-400" : "text-gray-500"}
                      `}
                    >
                      {doc.totalReviews} đánh giá
                    </p>

                    <div className="mt-3 text-center">
                      <span
                        className={`
                          text-sm font-medium opacity-0 group-hover:opacity-100 transition
                          ${theme === "dark" ? "text-sky-400" : "text-sky-600"}
                        `}
                      >
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`
                  absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-10
                  w-10 h-10 rounded-full shadow flex items-center justify-center
                  transition 
                   ${
                     theme === "dark"
                       ? " text-black hover:text-white cursor-pointer hover:bg-black bg-white/80"
                       : " text-black hover:text-white cursor-pointer hover:bg-gray-900 bg-white/80 border border-gray-200"
                   }
                  `}
            >
              <button
                aria-label="Next"
                onClick={handleNext}
                disabled={doctors.length <= doctorsPerView}
              >
                <ChevronRight className="w-6 h-6 cursor-pointer" />
              </button>
            </div>
          </div>
        )}

        <div className="w-full text-center mt-6">
          <button
            onClick={() => navigate("/top-rate-doctors")}
            className={`
              inline-flex items-center gap-1 font-medium text-[18px]
              transition
              ${
                theme === "dark"
                  ? "text-sky-400 hover:text-sky-300"
                  : "text-sky-600 hover:text-sky-700"
              }
            `}
          >
            Xem tất cả »
          </button>
        </div>
      </div>
    </section>
  );
};

export default DoctorCarousel;
