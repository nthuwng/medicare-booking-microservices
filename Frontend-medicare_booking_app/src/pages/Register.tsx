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
  Alert,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { FormProps } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerAPI,
  verifyOtpRegisterAPI,
  resendOtpRegisterAPI,
} from "@/services/api";
import { useCurrentApp } from "@/components/contexts/app.context";

type FieldType = {
  email: string;
  password: string;
};

const RESEND_SECONDS = 60;

const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [step, setStep] = useState(0);

  // state cho OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [counter, setCounter] = useState(RESEND_SECONDS);
  const timerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      setIsSubmit(true);
      const { email, password } = values;
      const res = await registerAPI(email, password);
      if (res?.success === true) {
        setEmail(email);
        setStep(1);
        message.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP xác thực."
        );
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

  // countdown gửi lại OTP khi sang step 1
  useEffect(() => {
    if (step !== 1) return;

    setCounter(RESEND_SECONDS);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = window.setInterval(() => {
      setCounter((c) => {
        if (c <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      message.warning("Vui lòng nhập đủ 6 ký tự OTP");
      return;
    }
    try {
      setVerifying(true);
      const res = await verifyOtpRegisterAPI(email, otp);
      if (res?.success === true) {
        message.success("Xác thực email thành công! Bạn có thể đăng nhập.");
        navigate("/login");
      } else {
        notification.error({
          message: "Xác thực OTP thất bại",
          description: res?.message,
        });
      }
    } catch (e: any) {
      message.error(e?.message || "OTP không hợp lệ");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    try {
      setSending(true);
      const res = await resendOtpRegisterAPI(email);

      if (res?.success === true) {
        setCounter(RESEND_SECONDS);

        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }

        timerRef.current = window.setInterval(() => {
          setCounter((c) => {
            if (c <= 1) {
              if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
              }
              return 0;
            }
            return c - 1;
          });
        }, 1000);

        message.success("Đã gửi lại mã OTP tới email");
      } else {
        notification.error({
          message: "Có lỗi khi gửi lại mã OTP",
          description: res?.message,
        });
      }
    } catch (e: any) {
      message.error(e?.message || "Không thể gửi lại OTP");
    } finally {
      setSending(false);
    }
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
              {step === 0 ? "Đăng ký tài khoản" : "Xác thực email đăng ký"}
            </Typography.Title>
            <Typography.Paragraph
              style={{
                textAlign: "center",
                color: isDark ? "#9ca3af" : "#666",
                marginTop: 0,
              }}
            >
              {step === 0
                ? "Bắt đầu trải nghiệm cùng Medicare"
                : "Nhập mã OTP được gửi tới email của bạn để kích hoạt tài khoản."}
            </Typography.Paragraph>
          </Space>

          <Divider
            style={{
              margin: "12px 0 20px",
              borderColor: isDark ? "#1f2a3a" : undefined,
            }}
          />

          {step === 0 && (
            <Form
              name="form-register"
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
                Đã có tài khoản?
                <span>
                  <Link
                    to="/login"
                    style={{ color: isDark ? "#93c5fd" : undefined }}
                  >
                    {" "}
                    Đăng nhập{" "}
                  </Link>
                </span>
              </Typography.Paragraph>
            </Form>
          )}

          {step === 1 && (
            <StepVerifyOtp
              isDark={isDark}
              email={maskedEmail}
              rawEmail={email}
              otp={otp}
              setOtp={setOtp}
              verifying={verifying}
              counter={counter}
              onResend={handleResendOtp}
              onVerify={handleVerifyOtp}
              sending={sending}
            />
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
};

/* ============== Sub component ============== */

const StepVerifyOtp = ({
  isDark,
  email,
  rawEmail,
  otp,
  setOtp,
  verifying,
  counter,
  onResend,
  onVerify,
  sending,
}: {
  isDark: boolean;
  email: string;
  rawEmail: string;
  otp: string;
  setOtp: (v: string) => void;
  verifying: boolean;
  counter: number;
  onResend: () => Promise<void>;
  onVerify: () => Promise<void>;
  sending: boolean;
}) => {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Alert
        type="info"
        message={
          <span className={isDark ? "!text-gray-100" : ""}>
            Đã gửi mã tới <b>{email}</b>
          </span>
        }
        description={
          <span className={isDark ? "!text-gray-300" : "!text-gray-600"}>
            Không nhận được? Kiểm tra hộp thư rác hoặc bấm <i>Gửi lại mã</i>.
          </span>
        }
        showIcon
        className={isDark ? "!bg-[#152238] !border-white/10" : ""}
      />

      <div className="flex flex-col items-center">
        <Typography.Text
          className={`!text-[18px] ${isDark ? "!text-gray-200" : ""}`}
        >
          Nhập mã OTP (6 số)
        </Typography.Text>

        <Input.OTP
          length={6}
          value={otp}
          onChange={setOtp}
          size="large"
          style={{ marginTop: 8, maxWidth: 360 }}
        />
      </div>

      <Space>
        <Button
          type="primary"
          size="large"
          onClick={onVerify}
          loading={verifying}
        >
          Xác minh
        </Button>
        <Button
          size="large"
          icon={<ReloadOutlined />}
          disabled={counter > 0 || sending}
          onClick={onResend}
          className={`${isDark ? "!text-white !bg-[#1d1d1d]" : ""}`}
        >
          {counter > 0 ? `Gửi lại (${counter}s)` : "Gửi lại mã"}
        </Button>
      </Space>

      <Typography.Paragraph
        className={isDark ? "!text-gray-400" : "!text-gray-500"}
        style={{ marginTop: 8 }}
      >
        Nhập sai nhiều lần có thể khiến mã hết hiệu lực. Bạn có thể quay lại
        bước trước để đổi email:{" "}
        <span>{rawEmail}</span>
      </Typography.Paragraph>
    </Space>
  );
};

/* ============== Utils ============== */
function maskEmail(input: string) {
  const [name, domain] = input.split("@");
  if (!name || !domain) return input;
  const head = name.slice(0, 2);
  const tail = name.slice(-1);
  return `${head}${"*".repeat(Math.max(1, name.length - 3))}${tail}@${domain}`;
}

export default RegisterPage;
