import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Card,
  Space,
  Typography,
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
  const { refreshUserData } = useCurrentApp();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      setIsSubmit(true);
      const { email, password } = values;
      const res = await loginAPI(email, password);
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

  return (
    <div
      className="register-page"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        // background: "linear-gradient(135deg, #f0f5ff 0%, #ffffff 60%)",

        background:
          "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderRadius: 12,
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Title
            level={3}
            style={{ marginBottom: 0, textAlign: "center" }}
          >
            Đăng nhập
          </Typography.Title>
          <Typography.Paragraph
            style={{ textAlign: "center", color: "#666", marginTop: 0 }}
          >
            Chào mừng bạn quay lại Medicare
          </Typography.Paragraph>
        </Space>
        <Divider style={{ margin: "12px 0 20px" }} />

        <Form
          name="form-login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Email"
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
            />
          </Form.Item>

          <Form.Item<FieldType>
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Mật khẩu không được để trống!" },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="••••••••"
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
            <Link to="/forgot-password">Quên mật khẩu?</Link>
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
            <GoogleLogin
              onSuccess={handleLoginWithGoogle}
              onError={() => {
                console.log("Login Failed");
              }}
              size="large"
            />
          </Space>

          <Divider plain>Hoặc</Divider>
          <Typography.Paragraph
            style={{ textAlign: "center", marginBottom: 0 }}
          >
            Chưa có tài khoản?
            <span>
              <Link to="/register"> Đăng ký </Link>
            </span>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
