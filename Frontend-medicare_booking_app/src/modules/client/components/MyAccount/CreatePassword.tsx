// src/components/MyAccount/CreatePassword.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  App,
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Steps,
  Typography,
  Modal,
  ConfigProvider,
  theme as antdTheme,
  type ThemeConfig,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  ReloadOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/contexts/app.context";
import {
  putUpdatePasswordFromEmailApi,
  resendOtpAPI,
  sendEmailOtpAPI,
  verifyOtpAPI,
} from "../../services/client.api";

const RESEND_SECONDS = 60;

interface Props {
  openChangePassword: boolean;
  setOpenChangePassword: (open: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const CreatePassword = (props: Props) => {
  const { openChangePassword, setOpenChangePassword, setLoading } =
    props;
  const { theme, user, refreshUserData } = useCurrentApp();
  const { message, notification } = App.useApp();

  const email = user?.email || "";
  const isDark = theme === "dark";
  const PRIMARY = "#2977FF";

  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);
  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(RESEND_SECONDS);
  const timerRef = useRef<number | null>(null);

  // AntD theme cho modal theo dark/light
  const modalTheme: ThemeConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorBgElevated: isDark ? "#0f1b2d" : "#fff",
      colorBgContainer: isDark ? "#0f1b2d" : "#fff",
      colorBorder: isDark ? "#1f2a3a" : "#e5e7eb",
      colorText: isDark ? "#e5e7eb" : "#0f172a",
      colorTextSecondary: isDark ? "#9CA3AF" : "#64748b",
      colorPrimary: "#2977FF",
      borderRadiusLG: 14,
    },
  };

  const handleCancel = () => {
    // reset nếu cần...
    setOpenChangePassword(false);
  };

  const getStepColor = (idx: number) =>
    idx <= step ? PRIMARY : isDark ? "#9CA3AF" : "#94a3b8";

  // Đếm ngược resend OTP khi ở step 1
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

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  /* ----------------- Handlers ----------------- */
  const handleClose = () => {
    // reset state khi đóng modal
    setStep(0);
    setOtp("");
    setCounter(RESEND_SECONDS);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setOpenChangePassword(false);
  };

  // STEP 0 — Gửi OTP
  const onSendOtp = async () => {
    if (!email) {
      message.error("Không tìm thấy email tài khoản!");
      return;
    }
    try {
      setSending(true);
      const res = await sendEmailOtpAPI(email);
      if (res?.success === true) {
        setStep(1);
        notification.success({
          message: res?.message || "Gửi mã OTP thành công",
          description: `Mã xác minh đã được gửi tới ${email}. Kiểm tra cả Spam.`,
        });
      } else {
        notification.error({
          message: "Có lỗi khi gửi mã OTP",
          description: res?.message,
        });
      }
    } catch (e: any) {
      message.error(e?.message || "Gửi OTP thất bại");
    } finally {
      setSending(false);
    }
  };

  // STEP 1 — Xác minh OTP
  const onVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      message.warning("Vui lòng nhập đủ 6 ký tự OTP");
      return;
    }
    try {
      setVerifying(true);
      const res = await verifyOtpAPI(email, otp);
      if (res?.success === true) {
        setStep(2);
        message.success("Xác minh OTP thành công");
      } else {
        notification.error({
          message: "Xác minh OTP thất bại",
          description: res?.message,
        });
      }
    } catch (e: any) {
      message.error(e?.message || "OTP không hợp lệ");
    } finally {
      setVerifying(false);
    }
  };

  // Gửi lại OTP
  const onResend = async () => {
    try {
      setSending(true);
      const res = await resendOtpAPI(email);
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
        message.success("Đã gửi lại OTP");
      } else {
        notification.error({
          message: "Có lỗi khi gửi mã OTP",
          description: res?.message,
        });
      }
    } catch (e: any) {
      message.error(e?.message || "Không thể gửi lại OTP");
    } finally {
      setSending(false);
    }
  };

  // STEP 2 — Tạo mật khẩu (dùng API putUpdatePasswordFromEmailApi)
  const onCreatePassword = async (values: {
    emailPassword: string; // mật khẩu tạm (đã tạo ngẫu nhiên trong DB và gửi email)
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu nhập lại chưa khớp");
      return;
    }
    try {
      setCreating(true);
      setLoading(true);
      const res = await putUpdatePasswordFromEmailApi(
        values.emailPassword,
        values.password,
        values.confirmPassword,
        email
      );
      if (res?.success === true) {
        notification.success({
          message: res?.message || "Tạo mật khẩu thành công",
          description:
            "Giờ bạn có thể đăng nhập bằng (email + mật khẩu) và (đăng nhập bằng google).",
        });
        await refreshUserData?.();
        handleClose();
      } else {
        notification.error({
          message: "Tạo mật khẩu thất bại",
          description: res?.message,
        });
      }
    } catch (e: any) {
      message.error(e?.message || "Có lỗi khi tạo mật khẩu");
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={modalTheme}>
      <Modal
        open={openChangePassword}
        onCancel={handleClose}
        footer={null}
        width={720}
        centered
        title={
          <div className="flex items-center gap-2">
            <LockOutlined style={{ color: PRIMARY }} />
            <span className={isDark ? "text-white" : ""}>
              Tạo mật khẩu đăng nhập
            </span>
          </div>
        }
        destroyOnClose
      >
        <div className="transition-all">
          <Steps
            current={step}
            items={[
              {
                title: (
                  <span style={{ color: getStepColor(0) }}>Xác nhận email</span>
                ),
                icon: <MailOutlined style={{ color: getStepColor(0) }} />,
                status: step > 0 ? "finish" : "process",
              },
              {
                title: (
                  <span style={{ color: getStepColor(1) }}>Xác minh OTP</span>
                ),
                icon: (
                  <SafetyCertificateOutlined
                    style={{ color: getStepColor(1) }}
                  />
                ),
                status: step > 1 ? "finish" : step === 1 ? "process" : "wait",
              },
              {
                title: (
                  <span style={{ color: getStepColor(2) }}>Tạo mật khẩu</span>
                ),
                icon: <LockOutlined style={{ color: getStepColor(2) }} />,
                status: step === 2 ? "process" : "wait",
              },
            ]}
          />

          <Divider />

          {step === 0 && (
            <StepShowEmail
              isDark={isDark}
              email={email}
              sending={sending}
              onSendOtp={onSendOtp}
            />
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
              onResend={onResend}
              onVerify={onVerifyOtp}
              sending={sending}
            />
          )}

          {step === 2 && (
            <StepCreatePassword
              isDark={isDark}
              creating={creating}
              onSubmit={onCreatePassword}
              handleCancel={handleCancel}
            />
          )}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

/* ------------------------ Sub Components ------------------------ */

const StepShowEmail = ({
  isDark,
  email,
  sending,
  onSendOtp,
}: {
  isDark: boolean;
  email: string;
  sending: boolean;
  onSendOtp: () => Promise<void>;
}) => (
  <Row gutter={[24, 24]} align="middle">
    <Col xs={24} md={14}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Text className={isDark ? "!text-gray-200" : ""}>
          Email tài khoản
        </Typography.Text>
        <Input
          size="large"
          value={email}
          readOnly
          prefix={<MailOutlined />}
          style={{ cursor: "not-allowed" }}
        />
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={onSendOtp}
          loading={sending}
          disabled={!email}
        >
          Gửi mã OTP
        </Button>
      </Space>
    </Col>
    <Col xs={24} md={10}>
      <Card
        className={`${
          isDark ? "!bg-[#152238] !border-white/10 !text-white" : ""
        }`}
        style={{ borderRadius: 12 }}
      >
        <Space direction="vertical">
          <Typography.Text
            className={isDark ? "!text-gray-100" : "!text-gray-800"}
          >
            Vì sao cần OTP?
          </Typography.Text>
          <Typography.Paragraph
            className={isDark ? "!text-gray-300" : "!text-gray-600"}
            style={{ margin: 0 }}
          >
            Mã 6 số giúp xác thực bạn là chủ của email này trước khi đặt mật
            khẩu mới.
          </Typography.Paragraph>
        </Space>
      </Card>
    </Col>
  </Row>
);

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
}) => (
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
      Mọi thao tác sẽ áp dụng cho email: <b>{rawEmail}</b>
    </Typography.Paragraph>
  </Space>
);

const passwordRules = [
  { required: true, message: "Vui lòng nhập mật khẩu" },
  { min: 8, message: "Tối thiểu 8 ký tự" },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số!",
  },
];

const StepCreatePassword = ({
  isDark,
  creating,
  onSubmit,
  handleCancel,
}: {
  isDark: boolean;
  creating: boolean;
  handleCancel: () => void;
  onSubmit: (values: {
    emailPassword: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
}) => {
  const [form] = Form.useForm();
  return (
    <>
      <Alert
        type="success"
        showIcon
        className={isDark ? "!bg-[#152238] !border-white/10" : ""}
        message={
          <Space align="center">
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            <span className={isDark ? "!text-gray-100" : ""}>
              OTP đã được xác minh
            </span>
          </Space>
        }
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label={
            <span className={isDark ? "!text-gray-200" : ""}>
              Mật khẩu tạm thời (đã gửi email)
            </span>
          }
          name="emailPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu tạm thời!" },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className={isDark ? "!text-gray-200" : ""}>Mật khẩu mới</span>
          }
          name="password"
          rules={passwordRules}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="••••••••"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className={isDark ? "!text-gray-200" : ""}>
              Nhập lại mật khẩu
            </span>
          }
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            ...passwordRules,
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value)
                  return Promise.resolve();
                return Promise.reject(new Error("Mật khẩu nhập lại chưa khớp"));
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="••••••••"
          />
        </Form.Item>

        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={creating}
          >
            Tạo mật khẩu
          </Button>
        </Space>
      </Form>
    </>
  );
};

/* ------------------------ Utils ------------------------ */
function maskEmail(input: string) {
  const [name, domain] = input.split("@");
  if (!name || !domain) return input;
  const head = name.slice(0, 2);
  const tail = name.slice(-1);
  return `${head}${"*".repeat(Math.max(1, name.length - 3))}${tail}@${domain}`;
}

export default CreatePassword;
