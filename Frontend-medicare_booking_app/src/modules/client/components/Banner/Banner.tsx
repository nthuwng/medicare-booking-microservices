import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrentApp } from "@/components/contexts/app.context";

type Slide = { id: number; img: string; alt?: string };

const slides: Slide[] = [
  { id: 1, img: "/Banner/doctor-banner-1.webp", alt: "Bệnh viện 1" },
  { id: 2, img: "/Banner/doctor-banner-2.webp", alt: "Bệnh viện 2" },
  { id: 3, img: "/Banner/doctor-banner-3.webp", alt: "Bệnh viện 3" },
];

/** srcSet/sizes đơn giản cho ảnh local (giúp đỡ mờ trên màn hình DPI cao) */
function buildSrcSet(url: string, baseW: number) {
  return `${url} ${baseW}w, ${url} ${baseW * 2}w`;
}
function sizesOf(widthPx: number) {
  return `(max-width: 768px) 100vw, ${widthPx}px`;
}

const AUTO = 4500;
const DURATION = 500; // ms

const Banner = () => {
  const { theme } = useCurrentApp(); // lấy light/dark từ context

  const [active, setActive] = useState(0);
  const [isHover, setIsHover] = useState(false);

  // animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "running">("idle");
  const timerRef = useRef<number | null>(null);
  const total = slides.length;

  const bigW = 720;
  const bigH = 420;
  const thumbW = 180;
  const thumbH = 120;

  const current = useMemo(() => slides[active], [active]);

  // autoplay (tạm dừng khi hover hoặc đang animate)
  useEffect(() => {
    if (isHover || isAnimating) return;
    timerRef.current = window.setInterval(() => startSlide("next"), AUTO);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isHover, isAnimating]);

  const startSlide = (direction: "next" | "prev", target?: number) => {
    if (isAnimating) return;
    const idx =
      typeof target === "number"
        ? target
        : direction === "next"
        ? (active + 1) % total
        : (active - 1 + total) % total;

    setDir(direction);
    setNextIndex(idx);
    setIsAnimating(true);
    setPhase("idle");

    // kick animation on next frame
    requestAnimationFrame(() => setPhase("running"));

    // end animation after duration
    window.setTimeout(() => {
      setActive(idx);
      setIsAnimating(false);
      setNextIndex(null);
      setPhase("idle");
    }, DURATION);
  };

  const next = () => startSlide("next");
  const prev = () => startSlide("prev");

  const go = (idx: number) => {
    if (idx === active) return;
    // xác định hướng dựa trên vị trí
    const forward =
      (idx > active && !(active === 0 && idx === total - 1)) ||
      (active === total - 1 && idx === 0);
    startSlide(forward ? "next" : "prev", idx);
  };

  return (
    <section
      className={`
        w-full transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-[#0D1224]" // nền tối
            : "bg-gradient-to-br from-[#f4fbff] via-white to-[#fff7fb]"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          {/* LEFT: Ảnh lớn với hiệu ứng trượt */}
          <div
            className="relative"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <div
              className={`
                relative rounded-2xl overflow-hidden shadow-lg ring-1 h-[420px]
                ${
                  theme === "dark"
                    ? "ring-white/10 bg-[#0e182b]"
                    : "ring-black/5 bg-white"
                }
              `}
            >
              {/* layer: current */}
              <img
                key={`cur-${current.id}-${active}`}
                src={current.img}
                srcSet={buildSrcSet(current.img, bigW)}
                sizes={sizesOf(bigW)}
                alt={current.alt || "banner"}
                className={[
                  "absolute inset-0 w-full h-full object-cover",
                  isAnimating && phase === "running"
                    ? dir === "next"
                      ? "translate-x-[-100%]"
                      : "translate-x-[100%]"
                    : "translate-x-0",
                  "transition-transform duration-[500ms] ease-out",
                ].join(" ")}
                width={bigW}
                height={bigH}
                loading="eager"
                decoding="async"
              />

              {/* layer: next (chỉ render khi animate) */}
              {isAnimating && nextIndex !== null && (
                <img
                  key={`next-${slides[nextIndex].id}-${nextIndex}`}
                  src={slides[nextIndex].img}
                  srcSet={buildSrcSet(slides[nextIndex].img, bigW)}
                  sizes={sizesOf(bigW)}
                  alt={slides[nextIndex].alt || "banner-next"}
                  className={[
                    "absolute inset-0 w-full h-full object-cover",
                    phase === "running"
                      ? "translate-x-0"
                      : dir === "next"
                      ? "translate-x-[100%]"
                      : "translate-x-[-100%]",
                    "transition-transform duration-[500ms] ease-out",
                  ].join(" ")}
                  width={bigW}
                  height={bigH}
                  loading="eager"
                  decoding="async"
                />
              )}
            </div>

            {/* Buttons navigation */}
            <div className="text-black hover:text-white cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-gray-900 shadow-md backdrop-blur flex items-center justify-center transition disabled:opacity-60">
              <button
                aria-label="Prev"
                onClick={prev}
                disabled={isAnimating}
                type="button"
              >
                <ChevronLeft className="cursor-pointer w-6 h-6 " />
              </button>
            </div>
            <div className="text-black hover:text-white cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-gray-900 shadow-md backdrop-blur flex items-center justify-center transition disabled:opacity-60">
              <button
                aria-label="Next"
                onClick={next}
                disabled={isAnimating}
                type="button"
              >
                <ChevronRight className="cursor-pointer w-6 h-6 " />
              </button>
            </div>
          </div>

          {/* RIGHT: Text + thumbnails + CTA */}
          <div>
            <h2
              className={`
                text-3xl md:text-[40px] font-extrabold leading-tight transition
                ${theme === "dark" ? "text-white" : "text-gray-900"}
              `}
            >
              Đặt lịch khám bệnh
              <span className="block">với MediCare</span>
            </h2>

            <div
              className={`h-1 w-24 rounded mt-3 mb-6 ${
                theme === "dark" ? "bg-blue-400" : "bg-blue-500"
              }`}
            />

            <p
              className={`
                leading-relaxed mb-6 transition
                ${theme === "dark" ? "text-gray-300" : "text-gray-700"}
              `}
            >
              MediCare mang đến dịch vụ y tế hiện đại, an toàn và chất lượng.
              Đặt lịch trực tuyến nhanh chóng, tư vấn từ xa tiện lợi, hồ sơ điện
              tử bảo mật và thanh toán minh bạch – tất cả trong một nền tảng tin
              cậy.
            </p>

            {/* Thumbnails */}
            <div className="flex gap-4 mb-8">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(i)}
                  className={`
                    rounded-xl overflow-hidden shadow-sm ring-1 transition focus:outline-none
                    ${
                      active === i
                        ? "ring-blue-400 ring-2"
                        : theme === "dark"
                        ? "ring-white/10"
                        : "ring-black/5"
                    }
                  `}
                  type="button"
                  aria-label={`Ảnh ${i + 1}`}
                  disabled={isAnimating}
                >
                  <img
                    src={s.img}
                    srcSet={buildSrcSet(s.img, thumbW)}
                    sizes={`(max-width: 768px) 33vw, ${thumbW}px`}
                    alt={s.alt || `thumb-${i + 1}`}
                    className="block object-cover"
                    width={thumbW}
                    height={thumbH}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>

            {/* CTA */}
            <Link to="/booking-options">
              <button
                className={`
                  cursor-pointer px-8 py-3 rounded-full font-semibold transition-all duration-300
                  transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[200px]
                  ${
                    theme === "dark"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
                `}
              >
                Đặt lịch ngay
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
