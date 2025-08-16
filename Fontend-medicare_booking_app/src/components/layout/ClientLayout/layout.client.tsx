import { Outlet } from "react-router-dom";
import ClientHeader from "./ClientHeader";
import ClientFooter from "./ClientFooter";
import ScrollToTopButton from "@/modules/client/components/ScrollToTopButton/ScrollToTopButton";

const LayoutClient = () => {
  return (
    <>
      <ClientHeader />
      <Outlet />
      <ScrollToTopButton />
      <ClientFooter />
    </>
  );
};

export default LayoutClient;
