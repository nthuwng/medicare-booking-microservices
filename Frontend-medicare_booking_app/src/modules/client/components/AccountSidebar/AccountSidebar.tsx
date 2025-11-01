import { NavLink } from "react-router-dom";
import { User, MessagesSquare, CalendarCheck } from "lucide-react";
import { useCurrentApp } from "@/components/contexts/app.context";

const links = [
  { label: "Quản lý tài khoản", to: "/my-account", Icon: User },
  { label: "Trang tin nhắn", to: "/message", Icon: MessagesSquare },
  { label: "Lịch đã đặt", to: "/my-appointments", Icon: CalendarCheck },
];

const AccountSidebar = () => {
  const { theme } = useCurrentApp();

  return (
    <aside className="w-full max-w-[320px]">
      <div
        className={`rounded-xl overflow-hidden shadow-sm border transition ${
          theme === "dark"
            ? "bg-[#0f1b2d] border-white/10"
            : "bg-white border-slate-200"
        }`}
      >
        {/* HEADER */}
        <div
          className={`p-4 border-b transition ${
            theme === "dark" ? "border-white/10" : "border-slate-100"
          }`}
        >
          <h3
            className={`m-0 text-base font-semibold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            Quản lý
          </h3>
          <p
            className={`m-0 mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Tài khoản & đặt lịch
          </p>
        </div>

        {/* LINKS */}
        <nav className="flex flex-col p-2">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                [
                  "flex items-center justify-between gap-2 px-3 py-2 my-1 rounded-lg transition font-medium",
                  isActive
                    ? theme === "dark"
                      ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-white/5 border border-transparent"
                    : "text-slate-700 hover:bg-slate-50 border border-transparent",
                ].join(" ")
              }
            >
              <span className="flex items-center gap-2 text-sm">
                {item.Icon && (
                  <item.Icon
                    className={`w-4 h-4 ${
                      theme === "dark" ? "text-inherit" : "text-inherit"
                    }`}
                  />
                )}
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AccountSidebar;
