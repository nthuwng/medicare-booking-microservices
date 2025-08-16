import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Banner.css";

// Define the type for a single slide object
interface SlideItem {
  id: number;
  img: string;
}

// Define the main App component
const Banner = () => {
  const slides: SlideItem[] = [
    {
      id: 1,
      img: "/src/assets/Banner/doctor-banner-1.jpg",
    },
    {
      id: 2,
      img: "/src/assets/Banner/doctor-banner-2.jpg",
    },
    {
      id: 3,
      img: "/src/assets/Banner/doctor-banner-3.jpg",
    },
  ];

  const AUTOCHANGE_TIME = 4000;
  const [activeSlide, setActiveSlide] = useState(0);

  // useEffect to handle the auto-change timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, AUTOCHANGE_TIME);

    // Clean up timer on component unmount
    return () => clearInterval(timer);
  }, [slides.length]);

  // Function to change slides manually
  const changeSlides = (change: number) => {
    setActiveSlide(
      (currentSlide) => (currentSlide + change + slides.length) % slides.length
    );
  };

  return (
    <>
      <section className="relative">
        <div className="banner-container relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] overflow-hidden text-white font-inter mt-16">
          {/* Slides Container */}
          <div className="relative h-full w-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out slide-${index} ${
                  activeSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Background Image with animated overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={slide.img}
                    alt={slide.id.toString()}
                    className={`object-cover w-full h-full transition-transform duration-[1000ms] ease-in-out hover:scale-[1.02] ${
                      activeSlide === index ? "scale-105" : "scale-100"
                    }`}
                  />
                </div>
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>

          {/* Navigation Controls - Tách riêng và đặt z-index cao nhất */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            {/* Left Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 md:left-8 lg:left-12 pointer-events-auto">
              <button
                onClick={() => changeSlides(-1)}
                className="p-2 sm:p-3 bg-white/30 hover:bg-white/50 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                aria-label="Previous Slide"
                type="button"
                style={{ zIndex: 10000 }}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </button>
            </div>

            {/* Right Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 md:right-8 lg:right-12 pointer-events-auto">
              <button
                onClick={() => changeSlides(1)}
                className="p-2 sm:p-3 bg-white/30 hover:bg-white/50 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                aria-label="Next Slide"
                type="button"
                style={{ zIndex: 10000 }}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 pointer-events-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === index
                      ? "bg-white scale-110"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  type="button"
                  style={{ zIndex: 10000 }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Chăm sóc sức khỏe
              <span className="block text-blue-200 mt-2">tại nhà</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed opacity-95">
              Kết nối với các bác sĩ chuyên môn cao, nhận tư vấn y tế chất lượng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[200px]">
                Đặt lịch ngay
              </button>
              <button className="cursor-pointer border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 min-w-[200px]">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
