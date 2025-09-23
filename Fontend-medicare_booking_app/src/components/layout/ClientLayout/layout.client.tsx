import { Outlet } from "react-router-dom";
import ClientHeader from "./ClientHeader";
import ClientFooter from "./ClientFooter";
import ScrollToTopButton from "@/modules/client/components/ScrollToTopButton/ScrollToTopButton";

const LayoutClient = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        <main className="pt-16">
          <Outlet />
        </main>
        <ScrollToTopButton />
        <ClientFooter />
      </div>
    </>
  );
};

export default LayoutClient;
