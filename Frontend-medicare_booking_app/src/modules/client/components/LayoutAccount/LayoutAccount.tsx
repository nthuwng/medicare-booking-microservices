import { Outlet } from "react-router-dom";
import AccountSidebar from "../AccountSidebar/AccountSidebar";
import LayoutAccountHeader from "./LayoutAccount.header";
import { useLocation } from "react-router-dom";

const LayoutAccount = () => {
  const location = useLocation();
  const path = location.pathname;
  const title = path.includes("my-appointments")
    ? "Appointments"
    : path.includes("message")
    ? "Messages"
    : "Account";
  const breadcrumbs = [{ label: "Home", to: "/" }, { label: title }];

  return (
    <>
      <LayoutAccountHeader title={title} breadcrumbs={breadcrumbs} />
      <div className="w-[90%] mx-auto mt-5">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:basis-[18%] md:max-w-[320px]">
            <AccountSidebar />
          </div>
          <div className="flex-1">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutAccount;
