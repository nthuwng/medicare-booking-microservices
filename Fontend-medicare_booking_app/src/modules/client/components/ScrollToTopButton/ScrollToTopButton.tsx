import { useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible(window.scrollY > 200); // hiện khi cuộn xuống quá 200px
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  return (
    <button
      className={`
        fixed bottom-8 right-8 
        w-12 h-12 
        bg-indigo-500 hover:bg-indigo-600 
        text-white 
        border-none 
        rounded-full 
        text-xl 
        cursor-pointer 
        transition-all duration-300 ease-in-out
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        z-50
        ${
          visible
            ? "opacity-100 pointer-events-auto transform translate-y-0"
            : "opacity-0 pointer-events-none transform translate-y-2"
        }
      `}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <FaHome className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
