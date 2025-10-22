import Lottie from "lottie-react";
import notFoundAnimation from "@/assets/lotties/error404.json";

const NotFoundPage = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Lottie animationData={notFoundAnimation} />
    </div>
  );
};

export default NotFoundPage;
