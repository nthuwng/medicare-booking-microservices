import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTopRateDoctorsAPI } from "../../services/client.api";
import type { ITopRateDoctors } from "@/types/rating";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 12;

function getDoctorsPerView(width: number) {
  if (width <= 640) return 1;
  if (width <= 1024) return 2;
  return 4;
}

const DoctorCarousel = () => {
  const [doctors, setDoctors] = useState<ITopRateDoctors[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doctorsPerView, setDoctorsPerView] = useState(
    getDoctorsPerView(window.innerWidth)
  );
  const navigate = useNavigate();
  // Responsive Doctor count
  useEffect(() => {
    function handleResize() {
      setDoctorsPerView(getDoctorsPerView(window.innerWidth));
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTopRateDoctorsAPI(1, PAGE_SIZE);
        if (res.data) {
          setDoctors(res.data.result || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - doctorsPerView + doctors.length) % doctors.length
    );
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + doctorsPerView) % doctors.length);
  };

  const getVisibleDoctors = () => {
    if (doctors.length <= doctorsPerView) return doctors;
    let endIdx = currentIndex + doctorsPerView;
    if (endIdx <= doctors.length) {
      return doctors.slice(currentIndex, endIdx);
    } else {
      return [
        ...doctors.slice(currentIndex),
        ...doctors.slice(0, endIdx - doctors.length),
      ];
    }
  };

  // Style helpers
  const getSizeClass = () => {
    if (doctorsPerView === 1) return "w-40 h-40 md:w-48 md:h-48";
    if (doctorsPerView === 2) return "w-28 h-28 md:w-36 md:h-36";
    return "w-20 h-20 md:w-32 md:h-32";
  };
  const getItemWidth = () => {
    if (doctorsPerView === 1) return "w-full max-w-xs ";
    if (doctorsPerView === 2) return "w-1/2 max-w-sm ";
    return "w-36 md:w-56 ";
  };

  return (
    <section className="w-full my-10 px-2 md:px-10 lg:px-40 !mt-20">
      <div className="relative bg-gradient-to-r from-blue-100 via-blue-50 to-sky-100 rounded-2xl border border-blue-200 shadow-lg p-4 md:py-10 md:px-4 min-h-[300px] select-none">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 text-center tracking-wide">
          Bác sĩ nổi bật
        </h2>
        {doctors.length === 0 ? (
          <div className="min-h-[120px] w-full flex flex-col items-center justify-center text-blue-700 text-lg md:text-xl opacity-60 py-10">
            Không có dữ liệu bác sĩ nổi bật để hiển thị
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <button
              aria-label="Prev"
              onClick={handlePrev}
              className="rounded-full bg-white border border-blue-200 shadow p-2 hover:bg-blue-100 hover:scale-105 transition disabled:bg-gray-50 disabled:text-gray-300"
              disabled={doctors.length <= doctorsPerView}
            >
              <ChevronLeft className="w-8 h-8 text-blue-600" />
            </button>
            <div className="flex flex-1 justify-center gap-5 md:gap-8 cursor-pointer">
              {getVisibleDoctors().map((doc) => (
                <div
                  key={doc.doctorId}
                  onClick={() =>
                    navigate(`/booking-options/doctor/${doc.doctorId}`)
                  }
                  className={`group bg-white rounded-xl shadow-md p-5 border border-blue-50 flex flex-col items-center hover:shadow-lg transition-all duration-300 animate-fadeIn ${getItemWidth()}`}
                >
                  <div
                    className={`mb-3 rounded-full overflow-hidden border-4 border-blue-300 group-hover:scale-105 group-hover:border-blue-400 transition-all ${getSizeClass()}`}
                  >
                    <img
                      src={
                        doc.doctorProfile.avatarUrl || "/Logo/LOGO_MEDICARE.png"
                      }
                      alt={doc.doctorProfile.fullName}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="font-semibold text-sm md:text-lg line-clamp-1 text-center mb-1">
                    {doc.doctorProfile.title} {doc.doctorProfile.fullName}
                  </div>
                  <div className="text-xs md:text-base text-blue-700 opacity-70 line-clamp-1 mb-0.5 text-center">
                    {doc.doctorProfile.specialty?.specialtyName ||
                      "Không rõ chuyên khoa"}
                  </div>
                  <div className="mt-1 text-yellow-500 font-bold flex items-center gap-1 justify-center text-sm">
                    ★ {Number(doc.avgScore).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {doc.totalReviews} đánh giá
                  </div>
                </div>
              ))}
            </div>
            <button
              aria-label="Next"
              onClick={handleNext}
              className="rounded-full bg-white border border-blue-200 shadow p-2 hover:bg-blue-100 hover:scale-105 transition disabled:bg-gray-50 disabled:text-gray-300"
              disabled={doctors.length <= doctorsPerView}
            >
              <ChevronRight className="w-8 h-8 text-blue-600" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorCarousel;
