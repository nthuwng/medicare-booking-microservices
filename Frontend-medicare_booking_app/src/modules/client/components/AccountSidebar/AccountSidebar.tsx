import { NavLink } from "react-router-dom";
import { User, MessagesSquare, CalendarCheck } from "lucide-react";

const links = [
  { label: "Quản lý tài khoản", to: "/my-account", Icon: User },
  { label: "Trang tin nhắn", to: "/message", Icon: MessagesSquare },
  { label: "Lịch đã đặt", to: "/my-appointments", Icon: CalendarCheck },
];

const AccountSidebar = () => {
  return (
    <aside className="w-full max-w-[320px]">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="m-0 text-base font-semibold text-slate-900">
            Quản lý
          </h3>
          <p className="m-0 mt-1 text-sm text-slate-600">
            Tài khoản & đặt lịch
          </p>
        </div>
        <nav className="flex flex-col p-2">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                [
                  "flex items-center justify-between gap-2 px-3 py-2 my-1 rounded-lg border",
                  "text-slate-700 hover:bg-slate-50 border-transparent",
                  isActive ? "bg-blue-50 text-blue-700 border-blue-200" : "",
                ].join(" ")
              }
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {item.Icon && <item.Icon className="w-4 h-4" />}
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
