import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Space,
  Descriptions,
  Alert,
  Radio,
  Divider,
  message,
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
import { createVNPayPayment } from "../../services/client.api";

const { Title, Text, Paragraph } = Typography;

const PaymentSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<string>("vnpay");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
      // Thanh toán tiền mặt - chuyển đến trang thành công
      message.success("Đã chọn thanh toán tiền mặt tại phòng khám!", 2);
      setTimeout(() => {
        navigate("/profile/appointments");
      }, 2000);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
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
            <Title level={2} style={{ color: "#262626", marginBottom: "8px" }}>
              Đặt lịch thành công!
            </Title>
            <Paragraph
              style={{ fontSize: "16px", color: "#595959", margin: 0 }}
            >
              Vui lòng chọn phương thức thanh toán để hoàn tất
            </Paragraph>
          </div>
        </div>

        {/* Appointment Info */}
        <Card
          title={
            <Title level={4} style={{ margin: 0, color: "#262626" }}>
              Thông tin lịch khám
            </Title>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
            bordered
            size="middle"
            labelStyle={{
              backgroundColor: "#fafafa",
              fontWeight: "600",
              width: "140px",
              color: "#262626",
            }}
            contentStyle={{
              backgroundColor: "#ffffff",
              fontWeight: "500",
            }}
          >
            <Descriptions.Item label="Mã lịch khám">
              <Text
                code
                style={{
                  backgroundColor: "#e6f7ff",
                  border: "1px solid #bae7ff",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontWeight: "600",
                }}
              >
                {appointmentData.appointment.id}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian khám">
              <Text style={{ color: "#262626" }}>
                {new Date(
                  appointmentData.appointment.appointmentDateTime
                ).toLocaleString("vi-VN")}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Bệnh nhân">
              <Text style={{ color: "#262626" }}>
                {appointmentData.patient.patientName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Text style={{ color: "#262626" }}>
                {appointmentData.patient.patientPhone}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi phí" span={2}>
              <div
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  border: "2px solid #bae7ff",
                  textAlign: "center",
                  display: "inline-block",
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: "20px",
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
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Payment Selection */}
        <Card
          title={
            <Title level={4} style={{ margin: 0, color: "#262626" }}>
              Chọn phương thức thanh toán
            </Title>
          }
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* VNPay Option */}
              <Card
                hoverable
                style={{
                  borderRadius: "8px",
                  border:
                    paymentMethod === "vnpay"
                      ? "2px solid #1890ff"
                      : "1px solid #d9d9d9",
                  backgroundColor: "#ffffff",
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
                      <Title level={5} style={{ margin: 0, color: "#262626" }}>
                        Thanh toán online qua VNPay
                      </Title>
                      <Text type="secondary" style={{ fontSize: "14px" }}>
                        Thanh toán ngay bằng thẻ ATM, Internet Banking, Ví điện
                        tử
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
                          backgroundColor: "#f6f6f6",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#595959",
                        }}
                      >
                        <BankOutlined />
                        <span>Internet Banking</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          backgroundColor: "#f6f6f6",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#595959",
                        }}
                      >
                        <CreditCardOutlined />
                        <span>Thẻ ATM/Visa</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          backgroundColor: "#f6f6f6",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#595959",
                        }}
                      >
                        <WalletOutlined />
                        <span>Ví điện tử</span>
                      </div>
                    </Space>

                    <div>
                      <Text style={{ color: "#595959", fontSize: "13px" }}>
                        Thanh toán ngay, xác nhận tức thời. Bảo mật cao với SSL
                        256-bit.
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
                      : "1px solid #d9d9d9",
                  backgroundColor: "#ffffff",
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
                      <Title level={5} style={{ margin: 0, color: "#262626" }}>
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
                      <Text style={{ color: "#595959", fontSize: "13px" }}>
                        Lịch khám được xác nhận sau khi thanh toán tại phòng
                        khám. Vui lòng đến trước 15-30 phút và mang theo giấy tờ
                        tùy thân.
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
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "6px",
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSelectionPage;
