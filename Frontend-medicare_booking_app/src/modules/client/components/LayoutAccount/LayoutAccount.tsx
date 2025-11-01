import { Outlet, useLocation } from "react-router-dom";
import AccountSidebar from "../AccountSidebar/AccountSidebar";
import LayoutAccountHeader from "./LayoutAccount.header";
import { useCurrentApp } from "@/components/contexts/app.context";

const LayoutAccount = () => {
  const location = useLocation();
  const { theme } = useCurrentApp();

  const path = location.pathname;
  const title = path.includes("my-appointments")
    ? "Appointments"
    : path.includes("message")
    ? "Messages"
    : "Account";

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: title },
  ];

  return (
    <div
      className="min-h-screen transition"
      style={
        theme === "dark"
          ? {
              background: "#0D1224",
            }
          : {
              background: "#f8fafc",
            }
      }
    >
      <LayoutAccountHeader title={title} breadcrumbs={breadcrumbs} />

      <div className="w-[90%] mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:basis-[18%] md:max-w-[320px]">
            <AccountSidebar />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div
              className={`
                rounded-xl shadow-md p-4 md:p-6 transition border 
                ${theme === "dark" 
                  ? "bg-[#111a2b] border-[#1e293b] text-gray-200" 
                  : "bg-white border-slate-200 text-slate-800"}
              `}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutAccount;
