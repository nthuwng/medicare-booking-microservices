import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Card,
  Space,
  Typography,
  ConfigProvider,
  theme as antdTheme,
  type ThemeConfig,
} from "antd";
import { LockOutlined, MailOutlined, GoogleOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAPI } from "@/services/api";
import { useCurrentApp } from "@/components/contexts/app.context";

type FieldType = {
  email: string;
  password: string;
};

const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      setIsSubmit(true);
      const { email, password } = values;
      const res = await registerAPI(email, password);
      if (res?.success === true) {
        message.success(
          "Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục!"
        );
        navigate("/login");
      } else {
        notification.error({
          message: "Đăng ký tài khoản thất bại!",
          description: res?.message || "Vui lòng thử lại sau.",
          placement: "topRight",
        });
      }
    } finally {
      setIsSubmit(false);
    }
  };

  const handleSignupWithGoogle = () => {
    const baseURL = import.meta.env.VITE_BACKEND_URL || "";
    window.location.href = `${baseURL}/api/auth/google`;
  };

  // AntD tokens theo dark/light
  const localTheme: ThemeConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorBgBase: isDark ? "#0D1224" : "#ffffff",
      colorBgContainer: isDark ? "#0f1b2d" : "#ffffff",
      colorText: isDark ? "#e5e7eb" : "#0f172a",
      colorTextSecondary: isDark ? "#9ca3af" : "#64748b",
      colorBorder: isDark ? "#1f2a3a" : "#e5e7eb",
      colorPrimary: "#1677ff",
      borderRadiusLG: 14,
    },
    components: {
      Card: {
        headerBg: isDark ? "#0f1b2d" : "#fff",
        colorBorderSecondary: isDark ? "#1f2a3a" : "#e5e7eb",
        boxShadowTertiary: isDark
          ? "0 12px 40px rgba(2,6,23,0.48)"
          : "0 12px 40px rgba(2,6,23,0.08)",
      },
      Input: {
        colorBgContainer: isDark ? "#0b1626" : "#fff",
        colorBorder: isDark ? "#1f2a3a" : "#dfe3e8",
      },
      Select: {
        colorBgContainer: isDark ? "#0b1626" : "#fff",
        colorBorder: isDark ? "#1f2a3a" : "#dfe3e8",
        optionSelectedBg: isDark ? "#17233a" : undefined,
      },
      Button: { borderRadius: 10 },
    },
  };

  return (
    <ConfigProvider theme={localTheme}>
      <div
        className="register-page"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: isDark
            ? "radial-gradient(125% 125% at 50% 10%, #0D1224 35%, #0b1220 100%)"
            : "radial-gradient(125% 125% at 50% 10%, #fff 40%, #f1f5f9 100%)",
        }}
      >
        <Card
          style={{
            width: 520,
            borderRadius: 14,
            boxShadow: isDark
              ? "0 16px 50px rgba(2,6,23,0.55)"
              : "0 16px 50px rgba(2,6,23,0.08)",
            border: `1px solid ${isDark ? "#1f2a3a" : "#e5e7eb"}`,
          }}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Title
              level={3}
              style={{
                marginBottom: 0,
                textAlign: "center",
                color: isDark ? "#ffffff" : undefined,
              }}
            >
              Đăng ký tài khoản
            </Typography.Title>
            <Typography.Paragraph
              style={{
                textAlign: "center",
                color: isDark ? "#9ca3af" : "#666",
                marginTop: 0,
              }}
            >
              Bắt đầu trải nghiệm cùng Medicare
            </Typography.Paragraph>
          </Space>

          <Divider style={{ margin: "12px 0 20px", borderColor: isDark ? "#1f2a3a" : undefined }} />

          <Form name="form-register" layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item<FieldType>
              label={<span style={{ color: isDark ? "#d1d5db" : undefined }}>Email</span>}
              name="email"
              rules={[
                { required: true, message: "Email không được để trống!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="name@example.com"
                className={isDark ? "bg-[#0b1626] text-gray-100 border-[#1f2a3a] placeholder:text-gray-500" : ""}
              />
            </Form.Item>

            <Form.Item<FieldType>
              label={<span style={{ color: isDark ? "#d1d5db" : undefined }}>Mật khẩu</span>}
              name="password"
              rules={[{ required: true, message: "Mật khẩu không được để trống!" }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="••••••••"
                className={isDark ? "bg-[#0b1626] text-gray-100 border-[#1f2a3a] placeholder:text-gray-500" : ""}
              />
            </Form.Item>

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button type="primary" size="large" htmlType="submit" loading={isSubmit} block>
                Đăng ký
              </Button>
              <Button
                icon={<GoogleOutlined />}
                size="large"
                onClick={handleSignupWithGoogle}
                block
                style={{
                  height: 40,
                  fontWeight: 500,
                  background: isDark ? "#111827" : "#fff",
                  color: isDark ? "#e5e7eb" : "#111827",
                  borderColor: isDark ? "#1f2937" : "#d1d5db",
                }}
              >
                Đăng ký với Google
              </Button>
            </Space>

            <Divider plain style={{ borderColor: isDark ? "#1f2a3a" : undefined }}>
              Hoặc
            </Divider>
            <Typography.Paragraph
              style={{
                textAlign: "center",
                marginBottom: 0,
                color: isDark ? "#d1d5db" : undefined,
              }}
            >
              Đã có tài khoản?
              <span>
                <Link to="/login" style={{ color: isDark ? "#93c5fd" : undefined }}>
                  {" "}
                  Đăng nhập{" "}
                </Link>
              </span>
            </Typography.Paragraph>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default RegisterPage;
