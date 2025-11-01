// src/modules/client/pages/ContactPartnerPage.tsx
import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  App,
} from "antd";
import { MailOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import { useCurrentApp } from "@/components/contexts/app.context";

const { Title, Paragraph, Text } = Typography;

const CITIES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Khác",
];

const ContactPartnerPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { theme } = useCurrentApp();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const mailto = buildMailTo(values);
      window.location.href = mailto;

      setTimeout(() => {
        setLoading(false);
        message.success("Đã mở ứng dụng email để gửi thông tin hợp tác.");
      }, 300);
    } catch {}
  };

  function buildMailTo(values: any) {
    const to = "business@medicare.vn";
    const subject = encodeURIComponent(
      `[Hợp tác phòng khám] ${values.clinicName}`
    );
    const body = encodeURIComponent(
      `Thông tin liên hệ\n\n` +
        `- Tên cơ sở: ${values.clinicName}\n` +
        `- Người liên hệ: ${values.contactName}\n` +
        `- Email: ${values.email}\n` +
        `- Điện thoại: ${values.phone}\n` +
        `- Thành phố: ${values.city}\n` +
        `- Ghi chú: ${values.note || "(không)"}\n\n` +
        `Vui lòng liên hệ lại để trao đổi thêm.`
    );
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }

  return (
    <div
      className="transition-all pb-12 pt-10"
      style={{
        ...(theme === "dark"
          ? { background: "#0D1224" }
          : {
              backgroundImage: `
              linear-gradient(to right, rgba(229,231,235,0.75) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(229,231,235,0.75) 1px, transparent 1px),
              radial-gradient(circle 600px at 0% 20%, rgba(139,92,246,0.25), transparent),
              radial-gradient(circle 600px at 100% 0%, rgba(59,130,246,0.25), transparent)
            `,
              backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
            }),
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[24, 24]}>
          {/* LEFT INFO */}
          <Col xs={24} md={12}>
            <Title
              level={2}
              className={`!font-extrabold !mb-4 ${
                theme === "dark" ? "!text-white" : "!text-blue-700"
              }`}
            >
              Hợp tác cùng MediCare
            </Title>

            <Paragraph
              className={`!text-base leading-relaxed ${
                theme === "dark" ? "!text-gray-300" : "!text-slate-600"
              }`}
            >
              Chúng tôi luôn chào đón các phòng khám, bệnh viện và bác sĩ hợp
              tác để mang lại trải nghiệm đặt lịch tốt hơn cho người bệnh.
              Hãy gửi thông tin bên cạnh, đội ngũ phụ trách sẽ liên hệ lại trong
              vòng 24–48 giờ làm việc.
            </Paragraph>

            <Card
              className={`!mt-4 transition ${
                theme === "dark"
                  ? "!bg-[#0f1b2d] !border-white/10 !text-white"
                  : "!shadow"
              }`}
              style={{ borderRadius: 14 }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MailOutlined />
                  <Text className={theme === "dark" ? "!text-gray-200" : ""}>
                    business@medicare.vn
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneOutlined />
                  <Text className={theme === "dark" ? "!text-gray-200" : ""}>
                    0356 566 573
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <HomeOutlined />
                  <Text className={theme === "dark" ? "!text-gray-200" : ""}>
                    123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* RIGHT FORM */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span
                  className={`${theme === "dark" ? "!text-white" : "!text-gray-800"}`}
                >
                  Đăng ký hợp tác
                </span>
              }
              className={`transition ${
                theme === "dark"
                  ? "!bg-[#0f1b2d] !border-white/10 !text-white"
                  : "!shadow-md"
              }`}
              style={{ borderRadius: 14 }}
            >
              <Form
                layout="vertical"
                form={form}
                className={theme === "dark" ? "dark-form" : ""}
              >
                <Form.Item
                  label={
                    <span className={theme === "dark" ? "!text-gray-200" : ""}>
                      Tên cơ sở y tế
                    </span>
                  }
                  name="clinicName"
                  rules={[{ required: true, message: "Vui lòng nhập tên cơ sở" }]}
                >
                  <Input
                    placeholder="VD: Phòng khám Đa khoa ABC"
                    className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                  />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className={theme === "dark" ? "!text-gray-200" : ""}>
                          Người liên hệ
                        </span>
                      }
                      name="contactName"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                      <Input
                        placeholder="Nguyễn Văn A"
                        className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className={theme === "dark" ? "!text-gray-200" : ""}>
                          Chức vụ (không bắt buộc)
                        </span>
                      }
                      name="position"
                    >
                      <Input
                        placeholder="Quản lý cơ sở, Trưởng phòng..."
                        className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className={theme === "dark" ? "!text-gray-200" : ""}>
                          Email
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input
                        placeholder="email@clinic.vn"
                        className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span className={theme === "dark" ? "!text-gray-200" : ""}>
                          Điện thoại
                        </span>
                      }
                      name="phone"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                      <Input
                        placeholder="0xx xxxx xxx"
                        className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span className={theme === "dark" ? "!text-gray-200" : ""}>
                      Thành phố
                    </span>
                  }
                  name="city"
                >
                  <Select
                    placeholder="Chọn tỉnh/thành"
                    className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                  >
                    {CITIES.map((c) => (
                      <Select.Option key={c} value={c}>
                        {c}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className={theme === "dark" ? "!text-gray-200" : ""}>
                      Nhu cầu hợp tác/Ghi chú
                    </span>
                  }
                  name="note"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Mô tả ngắn gọn nhu cầu hợp tác"
                    className={theme === "dark" ? "bg-[#152238] text-white" : ""}
                  />
                </Form.Item>

                <Button type="primary" onClick={onSubmit} loading={loading} block>
                  Gửi thông tin
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ContactPartnerPage;
