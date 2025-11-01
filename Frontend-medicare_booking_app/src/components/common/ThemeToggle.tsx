import { useCurrentApp } from "@/components/contexts/app.context";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
type Mode = "light" | "dark";

export default function ThemeToggle() {
  const { theme, setTheme } = useCurrentApp();
  const next = theme === "light" ? "dark" : "light";
  const toggle = () => setTheme(next as Mode);

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`cursor-pointer relative inline-flex items-center justify-center w-10 h-10 rounded-full not-last-of-type:hover:ring-4 ${
        theme === "dark"
          ? "bg-gray-900 hover:bg-white border border-gray-800 text-blue-400 hover:text-black"
          : "bg-white hover:bg-black border border-gray-200 hover:text-white text-yellow-600"
      }`}
      style={{ boxShadow: "var(--shadow) theme" }}
    >
      {theme === "light" ? (
        <IoSunnyOutline
          className=" hover:text-white cursor-pointer"
          size={20}
        />
      ) : (
        <IoMoonOutline className="cursor-pointer hover:text-black" size={20} />
      )}
    </button>
  );
}
