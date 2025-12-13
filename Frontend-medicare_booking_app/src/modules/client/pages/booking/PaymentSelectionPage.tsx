import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Space,
  Alert,
  Radio,
  Divider,
  message,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import {
  CheckCircleOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  ArrowLeftOutlined,
  PayCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  createCashPayment,
  createVNPayPayment,
} from "../../services/client.api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useCurrentApp } from "@/components/contexts/app.context";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text, Paragraph } = Typography;

const PaymentSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<string>("vnpay");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Theme context
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";

  // Lấy dữ liệu appointment từ navigation state
  const appointmentData = location.state?.appointmentData;

  if (!appointmentData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Card style={{ maxWidth: 400, textAlign: "center" }}>
          <Title level={4} style={{ color: "#595959" }}>
            Không tìm thấy thông tin đặt lịch
          </Title>
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);

    if (paymentMethod === "vnpay") {
      // Redirect đến VNPay
      try {
        const paymentData = {
          appointmentId: appointmentData.appointment.id,
          amount: appointmentData.appointment.totalFee,
          returnUrl: `${window.location.origin}/payment-return`,
          hospitalId: appointmentData.appointment.hospitalId,
          patientId: appointmentData.appointment.patientId,
        };

        // Gọi API tạo payment URL
        const paymentResponse = await createVNPayPayment(paymentData);

        const paymentResult = paymentResponse.data;

        if (paymentResult?.paymentUrl) {
          setRedirecting(true);
          message.info("Đang chuyển hướng đến trang thanh toán VNPay...", 3);
          setTimeout(() => {
            window.location.href = paymentResult.paymentUrl;
          }, 3000);
        } else {
          message.error("Không thể tạo URL thanh toán!");
          setLoading(false);
        }
      } catch (error) {
        console.error("Payment error:", error);
        message.error("Lỗi tạo thanh toán, vui lòng thử lại!");
        setLoading(false);
      }
    } else {
      // Thanh toán tiền mặt
      try {
        // Gọi API tạo CASH payment record
        const paymentResponse = await createCashPayment(
          appointmentData.appointment.id,
          String(appointmentData.appointment.totalFee),
          appointmentData.appointment.hospitalId,
          appointmentData.appointment.patientId
        );

        // Check response success
        if (paymentResponse?.success === true) {
          message.success("Đã tạo lịch hẹn thanh toán tiền mặt thành công!", 2);

          // Redirect đến trang thành công thanh toán tiền mặt sau 2 giây
          setTimeout(() => {
            navigate("/cash-payment-success", {
              state: { appointmentData },
            });
          }, 2000);
        } else {
          message.error("Không thể tạo thanh toán tiền mặt!");
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Cash payment error:", error);
        const errorMsg =
          error?.response?.data?.message ||
          "Lỗi tạo thanh toán, vui lòng thử lại!";
        message.error(errorMsg);
        setLoading(false);
      }
    }
  };

  // Theme configuration
  const localTheme = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#1890ff",
      colorSuccess: "#52c41a",
      colorWarning: "#faad14",
      colorError: "#ff4d4f",
      colorInfo: "#1890ff",
      colorBgBase: isDark ? "#141414" : "#ffffff",
      colorTextBase: isDark ? "#ffffff" : "#000000",
    },
  };

  return (
    <ConfigProvider theme={localTheme}>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: isDark ? "#0a1929" : "#f5f5f5",
          padding: "24px 0",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginBottom: "16px" }}
            >
              Quay lại
            </Button>

            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{
                  fontSize: "48px",
                  color: "#52c41a",
                  marginBottom: "16px",
                }}
              />
              <Title level={2} style={{ marginBottom: "8px" }}>
                Đặt lịch thành công!
              </Title>
              <Paragraph
                style={{ fontSize: "16px", margin: 0 }}
                type="secondary"
              >
                Vui lòng chọn phương thức thanh toán để hoàn tất
              </Paragraph>
            </div>
          </div>

          {/* Appointment Info */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Thông tin lịch khám
              </Title>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "8px",
              boxShadow: isDark
                ? "0 2px 8px rgba(255,255,255,0.05)"
                : "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Space
              direction="vertical"
              size="middle"
              style={{ width: "100%", padding: "8px 0" }}
            >
              {/* Mã lịch khám */}
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: window.innerWidth < 768 ? "4px" : "12px",
                  padding: "12px 16px",
                  backgroundColor: isDark ? "#1f1f1f" : "#fafafa",
                  borderRadius: "6px",
                  border: isDark ? "1px solid #303030" : "1px solid #f0f0f0",
                }}
              >
                <Text
                  strong
                  type="secondary"
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                    minWidth: window.innerWidth >= 768 ? "140px" : "auto",
                  }}
                >
                  Mã lịch khám:
                </Text>
                <Text
                  code
                  style={{
                    backgroundColor: isDark ? "#111d2c" : "#e6f7ff",
                    border: isDark ? "1px solid #15395b" : "1px solid #bae7ff",
                    color: isDark ? "#3c9ae8" : "#0958d9",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontWeight: "600",
                    fontSize: "clamp(12px, 2.8vw, 14px)",
                    wordBreak: "break-all",
                  }}
                >
                  {appointmentData.appointment.id}
                </Text>
              </div>

              {/* Thời gian khám */}
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: window.innerWidth < 768 ? "4px" : "12px",
                  padding: "12px 16px",
                  backgroundColor: isDark ? "#1f1f1f" : "#fafafa",
                  borderRadius: "6px",
                  border: isDark ? "1px solid #303030" : "1px solid #f0f0f0",
                }}
              >
                <Text
                  strong
                  type="secondary"
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                    minWidth: window.innerWidth >= 768 ? "140px" : "auto",
                  }}
                >
                  Thời gian khám:
                </Text>
                <Text
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                  }}
                >
                  {dayjs
                    .utc(appointmentData.appointment.appointmentDateTime)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("HH:mm:ss DD/MM/YYYY")}
                </Text>
              </div>

              {/* Bệnh nhân */}
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: window.innerWidth < 768 ? "4px" : "12px",
                  padding: "12px 16px",
                  backgroundColor: isDark ? "#1f1f1f" : "#fafafa",
                  borderRadius: "6px",
                  border: isDark ? "1px solid #303030" : "1px solid #f0f0f0",
                }}
              >
                <Text
                  strong
                  type="secondary"
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                    minWidth: window.innerWidth >= 768 ? "140px" : "auto",
                  }}
                >
                  Bệnh nhân:
                </Text>
                <Text
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                  }}
                >
                  {appointmentData.patient.patientName}
                </Text>
              </div>

              {/* Số điện thoại */}
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: window.innerWidth < 768 ? "4px" : "12px",
                  padding: "12px 16px",
                  backgroundColor: isDark ? "#1f1f1f" : "#fafafa",
                  borderRadius: "6px",
                  border: isDark ? "1px solid #303030" : "1px solid #f0f0f0",
                }}
              >
                <Text
                  strong
                  type="secondary"
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                    minWidth: window.innerWidth >= 768 ? "140px" : "auto",
                  }}
                >
                  Số điện thoại:
                </Text>
                <Text
                  style={{
                    fontSize: "clamp(13px, 3vw, 14px)",
                  }}
                >
                  {appointmentData.patient.patientPhone}
                </Text>
              </div>

              {/* Tổng chi phí */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "16px",
                  backgroundColor: isDark ? "#111d2c" : "#f0f9ff",
                  borderRadius: "8px",
                  border: isDark ? "2px solid #15395b" : "2px solid #bae7ff",
                  textAlign: "center",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "clamp(13px, 3vw, 14px)",
                    fontWeight: "500",
                  }}
                >
                  Tổng chi phí
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: "clamp(20px, 5vw, 24px)",
                    color: "#1890ff",
                    fontWeight: "700",
                  }}
                >
                  {Number(appointmentData.appointment.totalFee).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VND
                </Text>
              </div>
            </Space>
          </Card>

          {/* Payment Selection */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Chọn phương thức thanh toán
              </Title>
            }
            style={{
              borderRadius: "8px",
              boxShadow: isDark
                ? "0 2px 8px rgba(255,255,255,0.05)"
                : "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {/* VNPay Option */}
                <Card
                  hoverable
                  style={{
                    borderRadius: "8px",
                    border:
                      paymentMethod === "vnpay"
                        ? "2px solid #1890ff"
                        : isDark
                        ? "1px solid #303030"
                        : "1px solid #d9d9d9",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onClick={() => setPaymentMethod("vnpay")}
                >
                  <Radio value="vnpay" style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <PayCircleOutlined
                        style={{
                          fontSize: "24px",
                          color: "#1890ff",
                        }}
                      />
                      <div>
                        <Title level={5} style={{ margin: 0 }}>
                          Thanh toán online qua VNPay
                        </Title>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          Thanh toán ngay bằng thẻ ATM, Internet Banking, Ví
                          điện tử
                        </Text>
                      </div>
                    </div>
                  </Radio>

                  {paymentMethod === "vnpay" && (
                    <div style={{ marginTop: "16px", paddingLeft: "36px" }}>
                      <Alert
                        message="Bạn sẽ được chuyển đến cổng thanh toán VNPay an toàn"
                        type="info"
                        showIcon
                        style={{ marginBottom: "12px" }}
                      />

                      <Space wrap style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            backgroundColor: isDark ? "#1f1f1f" : "#f6f6f6",
                            borderRadius: "6px",
                            fontSize: "13px",
                          }}
                        >
                          <BankOutlined />
                          <Text type="secondary" style={{ fontSize: "13px" }}>
                            Internet Banking
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            backgroundColor: isDark ? "#1f1f1f" : "#f6f6f6",
                            borderRadius: "6px",
                            fontSize: "13px",
                          }}
                        >
                          <CreditCardOutlined />
                          <Text type="secondary" style={{ fontSize: "13px" }}>
                            Thẻ ATM/Visa
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            backgroundColor: isDark ? "#1f1f1f" : "#f6f6f6",
                            borderRadius: "6px",
                            fontSize: "13px",
                          }}
                        >
                          <WalletOutlined />
                          <Text type="secondary" style={{ fontSize: "13px" }}>
                            Ví điện tử
                          </Text>
                        </div>
                      </Space>

                      <div>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          Thanh toán ngay, xác nhận tức thời. Bảo mật cao với
                          SSL 256-bit.
                        </Text>
                      </div>
                    </div>
                  )}
                </Card>

                <Divider style={{ margin: "16px 0", color: "#8c8c8c" }}>
                  HOẶC
                </Divider>

                {/* Cash Option */}
                <Card
                  hoverable
                  style={{
                    borderRadius: "8px",
                    border:
                      paymentMethod === "cash"
                        ? "2px solid #52c41a"
                        : isDark
                        ? "1px solid #303030"
                        : "1px solid #d9d9d9",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  bodyStyle={{ padding: "20px" }}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <Radio value="cash" style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <WalletOutlined
                        style={{
                          fontSize: "24px",
                          color: "#52c41a",
                        }}
                      />
                      <div>
                        <Title level={5} style={{ margin: 0 }}>
                          Thanh toán tiền mặt tại phòng khám
                        </Title>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          Thanh toán khi đến khám bệnh
                        </Text>
                      </div>
                    </div>
                  </Radio>

                  {paymentMethod === "cash" && (
                    <div style={{ marginTop: "16px", paddingLeft: "36px" }}>
                      <Alert
                        message="Vui lòng mang theo tiền mặt và đến đúng giờ hẹn"
                        type="warning"
                        showIcon
                        style={{ marginBottom: "12px" }}
                      />

                      <div>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          Lịch khám được xác nhận sau khi thanh toán tại phòng
                          khám. Vui lòng đến trước 15-30 phút và mang theo giấy
                          tờ tùy thân.
                        </Text>
                      </div>
                    </div>
                  )}
                </Card>
              </Space>
            </Radio.Group>

            {/* Action Buttons */}
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => navigate("/")}
                  style={{
                    minWidth: "180px",
                    height: "44px",
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                >
                  Về trang chủ
                </Button>

                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handlePayment}
                  disabled={loading}
                  style={{
                    minWidth: "180px",
                    height: "44px",
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                  icon={
                    loading ? (
                      <LoadingOutlined />
                    ) : paymentMethod === "vnpay" ? (
                      <PayCircleOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                >
                  {loading && paymentMethod === "vnpay" && redirecting
                    ? "Đang chuyển hướng..."
                    : loading && paymentMethod === "vnpay"
                    ? "Đang tạo thanh toán..."
                    : loading && paymentMethod === "cash"
                    ? "Đang xử lý..."
                    : paymentMethod === "vnpay"
                    ? "Thanh toán VNPay"
                    : "Xác nhận thanh toán tiền mặt"}
                </Button>
              </Space>
            </div>

            {/* Security Notice */}
            <div style={{ marginTop: "20px" }}>
              <Alert
                message={
                  <div style={{ textAlign: "center" }}>
                    <Text strong style={{ color: "#52c41a" }}>
                      Bảo mật & An toàn
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      Thông tin của bạn được bảo vệ bằng công nghệ mã hóa SSL
                      256-bit
                    </Text>
                  </div>
                }
                type="success"
                showIcon={false}
                style={{
                  backgroundColor: isDark ? "#162312" : "#f6ffed",
                  border: isDark ? "1px solid #274916" : "1px solid #b7eb8f",
                  borderRadius: "6px",
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default PaymentSelectionPage;
