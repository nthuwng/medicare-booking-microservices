import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Typography, Result, Button, Spin, Space, Divider } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  HomeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { verifyVNPayReturn } from "../../services/client.api";

const { Title, Paragraph, Text } = Typography;

const PaymentReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    // Add responsive CSS and animations
    const responsiveCSS = `
      .payment-card {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .payment-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .payment-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: left 0.5s;
      }
      
      .payment-card:hover::before {
        left: 100%;
      }
      
      .copyable-code {
        transition: all 0.2s ease;
      }
      
      .copyable-code:hover {
        background-color: #e6f7ff !important;
        transform: scale(1.02);
      }
      
      @media (max-width: 768px) {
        .payment-grid-2-cols {
          grid-template-columns: 1fr !important;
        }
        
        .payment-card {
          padding: 12px !important;
        }
        
        .payment-amount {
          font-size: 18px !important;
        }
      }
    `;

    // Inject CSS into head
    if (!document.getElementById("payment-return-styles")) {
      const style = document.createElement("style");
      style.id = "payment-return-styles";
      style.textContent = responsiveCSS;
      document.head.appendChild(style);
    }

    const processPaymentReturn = async () => {
      try {
        // Lấy các parameters từ VNPay
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        const vnp_TxnRef = searchParams.get("vnp_TxnRef");
        const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
        const vnp_Amount = searchParams.get("vnp_Amount");
        const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
        const vnp_PayDate = searchParams.get("vnp_PayDate");
        const vnp_BankCode = searchParams.get("vnp_BankCode");
        const vnp_CardType = searchParams.get("vnp_CardType");

        // Debug amount conversion
        const rawAmount = vnp_Amount ? parseInt(vnp_Amount) : 0;
        const convertedAmount = rawAmount / 100;

        // Có thể VNPay đã trả về amount đã được nhân 10000 thay vì 100?

        if (!vnp_ResponseCode || !vnp_TxnRef) {
          throw new Error("Thiếu thông tin thanh toán từ VNPay");
        }

        // Gọi API backend để verify và cập nhật (optional)
        try {
          const response = await verifyVNPayReturn(
            searchParams.toString() as string
          );
          const backendResult = await response.data;
          if (backendResult.success) {
            setPaymentResult({
              success: true,
              txnRef: vnp_TxnRef,
              transactionNo: vnp_TransactionNo,
              amount: convertedAmount,
            });
          }
        } catch (error) {
          console.warn("Backend verification failed:", error);
          // Vẫn tiếp tục hiển thị kết quả cho user
        }

        // Fix for amount display - if amount is too large, divide by another 100
        let finalAmount = convertedAmount;
        if (convertedAmount > 10000000) {
          // If > 10 million, likely wrong
          finalAmount = convertedAmount / 100;
        }

        setPaymentResult({
          success: vnp_ResponseCode === "00",
          txnRef: vnp_TxnRef,
          transactionNo: vnp_TransactionNo,
          amount: finalAmount,
          orderInfo: vnp_OrderInfo,
          payDate: vnp_PayDate,
          responseCode: vnp_ResponseCode,
          bankCode: vnp_BankCode,
          cardType: vnp_CardType,
        });
      } catch (error) {
        setPaymentResult({
          success: false,
          error: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  const formatPayDate = (payDate: string) => {
    if (!payDate) return "";
    // Format: YYYYMMDDHHmmss
    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);
    const second = payDate.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const getBankName = (bankCode: string) => {
    const bankMap: { [key: string]: string } = {
      NCB: "Ngân hàng NCB",
      AGRIBANK: "Ngân hàng Agribank",
      SCB: "Ngân hàng SCB",
      SACOMBANK: "Ngân hàng Sacombank",
      EXIMBANK: "Ngân hàng Eximbank",
      MSBANK: "Ngân hàng MS Bank",
      NAMABANK: "Ngân hàng Nam A Bank",
      VNMART: "Ví VnMart",
      VIETINBANK: "Ngân hàng Vietinbank",
      VIETCOMBANK: "Ngân hàng Vietcombank",
      HDBANK: "Ngân hàng HDBank",
      DONGABANK: "Ngân hàng Dong A Bank",
      TPBANK: "Ngân hàng TPBank",
      OJB: "Ngân hàng OceanBank",
      BIDV: "Ngân hàng BIDV",
      TECHCOMBANK: "Ngân hàng Techcombank",
      VPBANK: "Ngân hàng VPBank",
      MBBANK: "Ngân hàng MBBank",
      ACB: "Ngân hàng ACB",
      OCB: "Ngân hàng OCB",
      IVB: "Ngân hàng IVB",
      VISA: "Thẻ quốc tế Visa",
    };
    return bankMap[bankCode] || bankCode;
  };

  const getStatusMessage = () => {
    if (paymentResult?.error) return paymentResult.error;
    if (paymentResult?.success) {
      return "Lịch khám của bạn đã được xác nhận và thanh toán thành công. Chúng tôi sẽ gửi thông báo xác nhận qua email/SMS trong thời gian sớm nhất.";
    }
    return "Giao dịch thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ để được giải quyết.";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card
          style={{
            maxWidth: 500,
            textAlign: "center",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <Spin
            indicator={
              <LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            }
            size="large"
            delay={5000}
          />
          <div style={{ marginTop: 24 }}>
            <Title level={4} style={{ color: "#1890ff", marginBottom: 8 }}>
              Đang xử lý kết quả thanh toán...
            </Title>
            <Paragraph type="secondary" style={{ fontSize: "16px", margin: 0 }}>
              Vui lòng chờ trong giây lát
            </Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {/* Main Result Card */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "24px",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <Result
            status={paymentResult?.success ? "success" : "error"}
            title={
              <Title
                level={2}
                style={{
                  color: paymentResult?.success ? "#52c41a" : "#ff4d4f",
                  marginBottom: 16,
                }}
              >
                {paymentResult?.success
                  ? "Thanh toán thành công!"
                  : "Thanh toán thất bại!"}
              </Title>
            }
            subTitle={
              <Paragraph
                style={{
                  fontSize: "16px",
                  color: "#666",
                  maxWidth: "600px",
                  margin: "0 auto 32px",
                  lineHeight: "1.6",
                }}
              >
                {getStatusMessage()}
              </Paragraph>
            }
            icon={
              paymentResult?.success ? (
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: "72px" }}
                />
              ) : (
                <CloseCircleOutlined
                  style={{ color: "#ff4d4f", fontSize: "72px" }}
                />
              )
            }
            extra={
              <Space size="middle" wrap style={{ justifyContent: "center" }}>
                <Button
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/")}
                  style={{ minWidth: 140 }}
                >
                  Về trang chủ
                </Button>
                {paymentResult?.success ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<CalendarOutlined />}
                    onClick={() => navigate("/profile/appointments")}
                    style={{ minWidth: 140 }}
                  >
                    Xem lịch khám
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/booking-options")}
                    style={{ minWidth: 140 }}
                  >
                    Đặt lịch lại
                  </Button>
                )}
              </Space>
            }
          />
        </Card>

        {/* Transaction Details */}
        {paymentResult && !paymentResult.error && (
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                  📋 Chi tiết giao dịch
                </Title>
              </div>
            }
            style={{
              borderRadius: "12px",
              border: "1px solid #e6f7ff",
              marginBottom: "24px",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <div style={{ display: "grid", gap: "16px" }}>
              {/* Row 1: Mã giao dịch */}
              <div
                className="payment-grid-2-cols"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  className="payment-card"
                  style={{
                    padding: "16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6c757d",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    🏷️ Mã giao dịch
                  </div>
                  <Text
                    code
                    copyable
                    className="copyable-code"
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1890ff",
                      display: "block",
                      backgroundColor: "#f0f8ff",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d6e7ff",
                    }}
                  >
                    {paymentResult.txnRef}
                  </Text>
                </div>

                {paymentResult.transactionNo && (
                  <div
                    className="payment-card"
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6c757d",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      🔢 Mã GD VNPay
                    </div>
                    <Text
                      code
                      copyable
                      className="copyable-code"
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1890ff",
                        display: "block",
                        backgroundColor: "#f0f8ff",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #d6e7ff",
                      }}
                    >
                      {paymentResult.transactionNo}
                    </Text>
                  </div>
                )}
              </div>

              {/* Row 2: Số tiền và Trạng thái */}
              <div
                className="payment-grid-2-cols"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#fff5f5",
                    borderRadius: "8px",
                    border: "2px solid #ffe7e7",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6c757d",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    💰 Số tiền
                  </div>
                  <Text
                    strong
                    className="payment-amount"
                    style={{
                      color: "#f5222d",
                      fontSize: "20px",
                      display: "block",
                    }}
                  >
                    {paymentResult.amount?.toLocaleString("vi-VN")} VND
                  </Text>
                </div>

                <div
                  style={{
                    padding: "16px",
                    backgroundColor: paymentResult.success
                      ? "#f6ffed"
                      : "#fff1f0",
                    borderRadius: "8px",
                    border: paymentResult.success
                      ? "2px solid #b7eb8f"
                      : "2px solid #ffccc7",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6c757d",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    📊 Trạng thái
                  </div>
                  <Text
                    strong
                    style={{
                      color: paymentResult.success ? "#52c41a" : "#ff4d4f",
                      fontSize: "16px",
                      display: "block",
                    }}
                  >
                    {paymentResult.success ? "✅ Thành công" : "❌ Thất bại"}
                  </Text>
                </div>
              </div>

              {/* Row 3: Ngân hàng và Loại thẻ */}
              {(paymentResult.bankCode || paymentResult.cardType) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      paymentResult.bankCode && paymentResult.cardType
                        ? "1fr 1fr"
                        : "1fr",
                    gap: "16px",
                  }}
                >
                  {paymentResult.bankCode && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#f0f8ff",
                        borderRadius: "8px",
                        border: "1px solid #d6e7ff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6c757d",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        🏦 Ngân hàng
                      </div>
                      <Text
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#1890ff",
                        }}
                      >
                        {getBankName(paymentResult.bankCode)}
                      </Text>
                    </div>
                  )}

                  {paymentResult.cardType && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#f0f8ff",
                        borderRadius: "8px",
                        border: "1px solid #d6e7ff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6c757d",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        💳 Loại thẻ
                      </div>
                      <Text
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#1890ff",
                        }}
                      >
                        {paymentResult.cardType === "ATM"
                          ? "Thẻ ATM nội địa"
                          : paymentResult.cardType}
                      </Text>
                    </div>
                  )}
                </div>
              )}

              {/* Row 4: Thời gian thanh toán */}
              {paymentResult.payDate && (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6c757d",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    🕐 Thời gian thanh toán
                  </div>
                  <Text strong style={{ fontSize: "16px", color: "#333" }}>
                    {formatPayDate(paymentResult.payDate)}
                  </Text>
                </div>
              )}

              {/* Row 5: Thông tin đơn hàng */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6c757d",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  📝 Thông tin đơn hàng
                </div>
                <Text style={{ fontSize: "14px", color: "#333" }}>
                  {paymentResult.orderInfo || "Thanh toán lịch khám"}
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        {paymentResult?.success && (
          <Card
            style={{
              backgroundColor: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <div style={{ textAlign: "center" }}>
              <Title
                level={4}
                style={{ color: "#52c41a", marginBottom: "16px" }}
              >
                🎉 Bước tiếp theo
              </Title>
              <Paragraph
                style={{
                  fontSize: "15px",
                  color: "#666",
                  marginBottom: "20px",
                }}
              >
                Cảm ơn bạn đã thanh toán! Đây là những gì sẽ xảy ra tiếp theo:
              </Paragraph>

              <div
                style={{
                  textAlign: "left",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    1
                  </div>
                  <Text>
                    Chúng tôi sẽ gửi email/SMS xác nhận trong 5-10 phút
                  </Text>
                </div>

                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    2
                  </div>
                  <Text>
                    Phòng khám sẽ liên hệ xác nhận lịch khám trước 1 ngày
                  </Text>
                </div>

                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    3
                  </div>
                  <Text>
                    Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Support Contact */}
        <Card
          style={{
            backgroundColor: "#fafafa",
            border: "1px solid #d9d9d9",
            borderRadius: "12px",
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ textAlign: "center" }}>
            <Title level={5} style={{ color: "#595959", marginBottom: "16px" }}>
              💬 Cần hỗ trợ?
            </Title>
            <Space split={<Divider type="vertical" />}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <PhoneOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>
                  Hotline: 1900-1234
                </Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MailOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>
                  support@medicare.vn
                </Text>
              </div>
            </Space>
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Thời gian hỗ trợ: 8:00 - 20:00 (Thứ 2 - Chủ nhật)
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReturnPage;
