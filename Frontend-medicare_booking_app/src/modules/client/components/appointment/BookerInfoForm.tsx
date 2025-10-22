import { Card, Typography, Row, Col, Form, Input, Radio } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface IProps {
  bookingFor: string;
  setBookingFor: (value: string) => void;
}

const BookerInfoForm = (props: IProps) => {
  const { bookingFor, setBookingFor } = props;

  return (
    <>
      {/* Booking For Section */}
      <Card
        style={{
          borderRadius: "16px",
          border: "2px solid #fff2e8",
          backgroundColor: "#fffbf5",
          boxShadow: "0 4px 12px rgba(250, 140, 22, 0.1)",
          marginBottom: "24px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <UserOutlined
              style={{
                fontSize: "20px",
                color: "#fa8c16",
                marginRight: "8px",
              }}
            />
            <Title level={5} style={{ margin: 0, color: "#fa8c16" }}>
              Đặt lịch cho ai?
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Chọn bạn đang đặt lịch cho ai
          </Text>
        </div>

        <Form.Item
          name="bookingFor"
          initialValue="self"
          rules={[{ required: true }]}
          style={{ marginBottom: 0 }}
        >
          <Radio.Group
            onChange={(e) => setBookingFor(e.target.value)}
            style={{ width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <Radio
                value="self"
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                  backgroundColor: "#ffffff",
                  fontWeight: "500",
                }}
              >
                👤 Đặt cho mình
              </Radio>
              <Radio
                value="other"
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #d9d9d9",
                  backgroundColor: "#ffffff",
                  fontWeight: "500",
                }}
              >
                👨‍👩‍👧‍👦 Đặt cho người thân
              </Radio>
            </div>
          </Radio.Group>
        </Form.Item>
      </Card>

      {/* Thông tin người đặt lịch - chỉ hiển thị khi đặt cho người thân */}
      {bookingFor === "other" && (
        <div
          style={{
            backgroundColor: "#f0f9ff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #bae6fd",
            marginBottom: "24px",
          }}
        >
          <Title level={5} style={{ color: "#0369a1", marginBottom: "16px" }}>
            👤 Thông tin người đặt lịch
          </Title>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Họ tên người đặt</Text>}
                name="bookerName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên người đặt!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập họ tên của bạn"
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Số điện thoại người đặt</Text>}
                name="bookerPhone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập số điện thoại của bạn"
                  prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text strong>Email người đặt</Text>}
                name="bookerEmail"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập email của bạn"
                  prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default BookerInfoForm;
