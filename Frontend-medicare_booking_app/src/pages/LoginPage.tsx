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
import { LockOutlined, MailOutlined, LoginOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI, loginWithGoogleAPI } from "@/services/api";
import { useCurrentApp } from "@/components/contexts/app.context";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type FieldType = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const { refreshUserData, theme } = useCurrentApp();
  const isDark = theme === "dark";

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { email, password } = values;
    try {
      setIsSubmit(true);

      const res = await loginAPI(email, password);

      if (res?.success === false) {
        notification.error({
          message: "Đăng nhập tài khoản thất bại!",
          description: res?.message || "Vui lòng thử lại sau.",
          placement: "topRight",
        });
      } else {
        localStorage.setItem("access_token", res?.data?.access_token || "");
        message.success("Đăng nhập tài khoản thành công!");
        await refreshUserData();
        navigate("/");
      }
    } catch (error: any) {
      // Bắt lỗi HTTP (401, 500, ...)
      const apiMessage =
        error?.response?.data?.message || "Vui lòng thử lại sau.";

      notification.error({
        message: "Đăng nhập tài khoản thất bại!",
        description: apiMessage,
        placement: "topRight",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  const handleLoginWithGoogle = async (response: CredentialResponse) => {
    const { credential } = response;
    const res = await loginWithGoogleAPI(credential as string);
    if (res?.data) {
      localStorage.setItem("access_token", res.data.access_token);
      message.success("Đăng nhập tài khoản thành công!");
      await refreshUserData();
      navigate("/");
    } else {
      notification.error({
        message: "Đăng nhập tài khoản thất bại!",
        description: res?.message || "Vui lòng thử lại sau.",
        placement: "topRight",
      });
    }
  };

  // AntD theme tokens theo dark/light
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
            : "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #f1f5f9 100%)",
        }}
      >
        <Card
          style={{
            width: 420,
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
              Đăng nhập
            </Typography.Title>
            <Typography.Paragraph
              style={{
                textAlign: "center",
                color: isDark ? "#9ca3af" : "#666",
                marginTop: 0,
              }}
            >
              Chào mừng bạn quay lại Medicare
            </Typography.Paragraph>
          </Space>

          <Divider
            style={{
              margin: "12px 0 20px",
              borderColor: isDark ? "#1f2a3a" : undefined,
            }}
          />

          <Form
            name="form-login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label={
                <span style={{ color: isDark ? "#d1d5db" : undefined }}>
                  Email
                </span>
              }
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
                className={
                  isDark
                    ? "bg-[#0b1626] text-gray-100 border-[#1f2a3a] placeholder:text-gray-500"
                    : ""
                }
              />
            </Form.Item>

            <Form.Item<FieldType>
              label={
                <span style={{ color: isDark ? "#d1d5db" : undefined }}>
                  Mật khẩu
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Mật khẩu không được để trống!" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="••••••••"
                className={
                  isDark
                    ? "bg-[#0b1626] text-gray-100 border-[#1f2a3a] placeholder:text-gray-500"
                    : ""
                }
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: -8,
                marginBottom: 8,
              }}
            >
              <Link
                to="/forgot-password"
                style={{ color: isDark ? "#93c5fd" : undefined }}
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                size="large"
                htmlType="submit"
                loading={isSubmit}
                block
              >
                Đăng nhập
              </Button>

              {/* Google login: tự đổi theme theo dark/light */}
              <div style={{ width: 400, margin: "0 auto" }}>
                <GoogleLogin
                  onSuccess={handleLoginWithGoogle}
                  onError={() =>
                    notification.error({
                      message: "Đăng nhập Google thất bại!",
                    })
                  }
                  locale="vi"
                  theme={isDark ? "filled_black" : "filled_blue"}
                  size="large"
                  text="signin_with"
                  shape="pill"
                  logo_alignment="left"
                  width="370"
                  useOneTap={false}
                />
              </div>
            </Space>

            <Divider
              plain
              style={{ borderColor: isDark ? "#1f2a3a" : undefined }}
            >
              Hoặc
            </Divider>

            <Typography.Paragraph
              style={{
                textAlign: "center",
                marginBottom: 0,
                color: isDark ? "#d1d5db" : undefined,
              }}
            >
              Chưa có tài khoản?
              <span>
                <Link
                  to="/register"
                  style={{ color: isDark ? "#93c5fd" : undefined }}
                >
                  {" "}
                  Đăng ký{" "}
                </Link>
              </span>
            </Typography.Paragraph>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
