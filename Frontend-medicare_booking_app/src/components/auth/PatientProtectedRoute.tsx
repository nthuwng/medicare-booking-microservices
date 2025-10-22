
import { useCurrentApp } from "components/contexts/app.context";
import Lottie from "lottie-react";
import notLoginAnimation from "@/assets/lotties/ProtectedAdmin.json";
import { Link } from "react-router-dom";
import { Button } from "antd";

interface IProps {
  children: React.ReactNode;
}

const PatientProtectedRoute = (props: IProps) => {
  const { isAuthenticated } = useCurrentApp();
  if (isAuthenticated === false) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16,
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
            borderRadius: 16,
            padding: 36,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            border: "1px solid rgba(15, 23, 42, 0.06)",
            textAlign: "center",
            width: "100%",
            maxWidth: 440,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Lottie
              animationData={notLoginAnimation}
              style={{ width: 140, height: 140, margin: "0 auto" }}
            />
          </div>
          <h2
            style={{
              color: "#0b1220",
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 6px 0",
            }}
          >
            Vui lòng đăng nhập
          </h2>
          <p
            style={{ color: "#6b7280", margin: "0 0 22px 0", lineHeight: 1.7 }}
          >
            Vui lòng đăng nhập để sử dụng đầy đủ tính năng.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/login" style={{ flex: 1 }}>
              <Button type="primary" size="large" block>
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register" style={{ flex: 1 }}>
              <Button size="large" block>
                Đăng ký
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{props.children}</>;
};

export default PatientProtectedRoute;
