import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Select,
  Card,
  Space,
  Typography,
} from "antd";
import { GoogleOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAPI } from "@/services/api";

type FieldType = {
  email: string;
  password: string;
  userType: string;
};

const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      setIsSubmit(true);
      const { email, password, userType } = values;
      const res = await registerAPI(email, password, userType);
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
          width: 520,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          borderRadius: 12,
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Title
            level={3}
            style={{ marginBottom: 0, textAlign: "center" }}
          >
            Đăng ký tài khoản
          </Typography.Title>
          <Typography.Paragraph
            style={{ textAlign: "center", color: "#666", marginTop: 0 }}
          >
            Bắt đầu trải nghiệm cùng Medicare
          </Typography.Paragraph>
        </Space>
        <Divider style={{ margin: "12px 0 20px" }} />

        <Form
          name="form-register"
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

          <Form.Item<FieldType>
            label="Vai trò"
            name="userType"
            rules={[
              { required: true, message: "Vai trò không được để trống!" },
            ]}
          >
            <Select size="large" placeholder="Chọn vai trò">
              <Select.Option value="DOCTOR">Bác sĩ</Select.Option>
              <Select.Option value="PATIENT">Bệnh nhân</Select.Option>
            </Select>
          </Form.Item>

          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={isSubmit}
              block
            >
              Đăng ký
            </Button>
            <Button
              icon={<GoogleOutlined />}
              size="large"
              onClick={handleSignupWithGoogle}
              block
            >
              Đăng ký với Google
            </Button>
          </Space>

          <Divider plain>Hoặc</Divider>
          <Typography.Paragraph
            style={{ textAlign: "center", marginBottom: 0 }}
          >
            Đã có tài khoản?
            <span>
              <Link to="/login"> Đăng nhập </Link>
            </span>
          </Typography.Paragraph>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
