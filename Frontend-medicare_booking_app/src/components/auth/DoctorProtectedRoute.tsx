import { Button } from "antd";
import { Link, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import notLoginAnimation from "@/assets/lotties/ProtectedAdmin.json";
import { useCurrentApp } from "components/contexts/app.context";

interface IProps {
  children: React.ReactNode;
}

const DoctorProtectedRoute = (props: IProps) => {
  const { isAuthenticated, user } = useCurrentApp();
  const location = useLocation();
  if (isAuthenticated === false) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,

          backgroundImage: `
          linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
          radial-gradient(900px 600px at -10% -10%, rgba(99, 102, 241, 0.12), transparent),
          radial-gradient(900px 600px at 110% -10%, rgba(139, 92, 246, 0.12), transparent)
        `,
        backgroundSize: `
          96px 64px,
          96px 64px,
          100% 100%,
          100% 100%
        `,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "48px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
            textAlign: "center",
            maxWidth: "420px",
            width: "90%",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <Lottie
              animationData={notLoginAnimation}
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto",
              }}
            />
          </div>

          <h2
            style={{
              color: "#1e293b",
              fontSize: "24px",
              fontWeight: "600",
              margin: "0 0 12px 0",
              letterSpacing: "-0.025em",
            }}
          >
            Vui lòng đăng nhập
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
              margin: "0 0 32px 0",
              lineHeight: "1.6",
            }}
          >
            Bạn cần đăng nhập để truy cập trang bác sĩ
          </p>
          <Link
            to="/login"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            <Button
              type="primary"
              size="large"
              style={{
                background: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                height: "44px",
                fontSize: "16px",
                fontWeight: "500",
                padding: "0 32px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                width: "100%",
              }}
            >
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isDoctorRoute = location.pathname.includes("doctor");
  if (isAuthenticated === true && isDoctorRoute === true) {
    const role = user?.userType;
    if (role !== "DOCTOR") {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "48px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              border: "1px solid #e2e8f0",
              textAlign: "center",
              maxWidth: "420px",
              width: "90%",
            }}
          >
            <div style={{ marginBottom: "32px" }}>
              <Lottie
                animationData={notLoginAnimation}
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "0 auto",
                }}
              />
            </div>
  
            <h2
              style={{
                color: "#1e293b",
                fontSize: "24px",
                fontWeight: "600",
                margin: "0 0 12px 0",
                letterSpacing: "-0.025em",
              }}
            >
              Bạn không phải là bác sĩ
            </h2>
  
            <p
              style={{
                color: "#64748b",
                fontSize: "16px",
                margin: "0 0 32px 0",
                lineHeight: "1.6",
              }}
            >
              Bạn không có quyền truy cập trang bác sĩ
            </p>
            <Link
              to="/"
              style={{
                color: "white",
                textDecoration: "none",
              }}
            >
              <Button
                type="primary"
                size="large"
                style={{
                  background: "#3b82f6",
                  border: "none",
                  borderRadius: "8px",
                  height: "44px",
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 32px",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  width: "100%",
                }}
              >
                Quay về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  return <>{props.children}</>;
};

export default DoctorProtectedRoute;
