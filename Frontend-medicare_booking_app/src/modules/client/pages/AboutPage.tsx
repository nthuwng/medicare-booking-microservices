import {
  Card,
  Col,
  Row,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
} from "antd";
import {
  ScheduleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  MobileOutlined,
  CustomerServiceOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCurrentApp } from "@/components/contexts/app.context";

const AboutPage = () => {
  const { isAuthenticated, theme } = useCurrentApp();

  return (
    <div
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
      className="transition-all min-h-screen"
    >
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Tag
                color="blue"
                style={{
                  alignSelf: "flex-start",
                  ...(theme === "dark" && {
                    background: "rgba(59,130,246,0.15)",
                    borderColor: "rgba(59,130,246,0.25)",
                    color: "#60a5fa",
                  }),
                }}
              >
                MediCare Booking
              </Tag>

              <Typography.Title
                level={2}
                className={`!font-extrabold transition ${
                  theme === "dark" ? "!text-white" : "!text-gray-900"
                }`}
              >
                Đặt lịch khám bệnh trực tuyến nhanh, tiện lợi, minh bạch
              </Typography.Title>

              <Typography.Paragraph
                className={`!mt-1 !text-[17px] transition ${
                  theme === "dark" ? "!text-gray-300" : "!text-gray-600"
                }`}
              >
                Nền tảng giúp bệnh nhân tìm bác sĩ phù hợp, đặt lịch, nhận nhắc
                lịch và quản lý hồ sơ khám chữa bệnh chỉ trong vài thao tác.
              </Typography.Paragraph>

              <Link to="/booking-options">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  className="!shadow"
                >
                  Bắt đầu đặt lịch
                </Button>
              </Link>
            </Space>
          </Col>

          {/* Feature mini box */}
          <Col xs={24} md={10}>
            <Card
              className={`transition ${
                theme === "dark"
                  ? "!bg-[#0f1b2d] !border-white/10 !text-white"
                  : "shadow-md"
              }`}
              style={{ borderRadius: 16 }}
              bodyStyle={{ padding: 20 }}
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <FeatureMini icon={<ScheduleOutlined />} title="Đặt lịch 24/7" theme={theme} />
                </Col>
                <Col span={12}>
                  <FeatureMini icon={<MobileOutlined />} title="Quản lý trên mobile" theme={theme} />
                </Col>
                <Col span={12}>
                  <FeatureMini icon={<SafetyCertificateOutlined />} title="Bảo mật & riêng tư" theme={theme} />
                </Col>
                <Col span={12}>
                  <FeatureMini icon={<CustomerServiceOutlined />} title="Hỗ trợ nhanh" theme={theme} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Card
          className={`transition ${
            theme === "dark"
              ? "!bg-[#0f1b2d] !border-white/10 !text-white"
              : "shadow-sm"
          }`}
          style={{ borderRadius: 16 }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Typography.Title
                level={4}
                className={theme === "dark" ? "!text-white" : ""}
              >
                Sứ mệnh của chúng tôi
              </Typography.Title>

              <Typography.Paragraph
                className={theme === "dark" ? "!text-gray-300" : "!text-gray-600"}
              >
                Giảm thời gian chờ, tăng trải nghiệm khám chữa bệnh. Bệnh nhân
                đặt lịch dễ dàng – bác sĩ chủ động quản lý – bệnh viện điều phối
                hiệu quả.
              </Typography.Paragraph>

              <Space size={[8, 8]} wrap>
                {["Minh bạch chi phí", "Nhắc lịch tự động", "Đánh giá sau khám", "Hồ sơ sức khỏe"].map(
                  (t, i) => (
                    <Tag
                      key={i}
                      className="font-medium"
                      style={
                        theme === "dark"
                          ? {
                              background: "rgba(255,255,255,0.08)",
                              borderColor: "rgba(255,255,255,0.15)",
                              color: "#e2e8f0",
                            }
                          : {}
                      }
                    >
                      {t}
                    </Tag>
                  )
                )}
              </Space>
            </Col>

            <Col xs={24} md={10}>
              <Stats theme={theme} />
            </Col>
          </Row>
        </Card>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <Typography.Title
          level={4}
          className={theme === "dark" ? "!text-white" : ""}
        >
          Tính năng nổi bật
        </Typography.Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <FeatureCard
              theme={theme}
              icon={<ThunderboltOutlined />}
              title="Đặt lịch siêu nhanh"
              desc="Chỉ 60 giây – tìm bác sĩ, chọn khung giờ và xác nhận."
            />
          </Col>
          <Col xs={24} md={8}>
            <FeatureCard
              theme={theme}
              icon={<TeamOutlined />}
              title="Bác sĩ uy tín"
              desc="Danh mục chuyên khoa rõ ràng, hồ sơ minh bạch."
            />
          </Col>
          <Col xs={24} md={8}>
            <FeatureCard
              theme={theme}
              icon={<SafetyCertificateOutlined />}
              title="An toàn dữ liệu"
              desc="Mã hóa – kiểm soát truy cập – bảo mật tối đa."
            />
          </Col>
        </Row>
      </div>

      {/* How it works */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <Card
          className={`transition ${
            theme === "dark"
              ? "!bg-[#0f1b2d] !border-white/10 !text-white"
              : ""
          }`}
          style={{ borderRadius: 16 }}
        >
          <Typography.Title
            level={4}
            className={theme === "dark" ? "!text-white" : ""}
          >
            Quy trình đặt lịch
          </Typography.Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Step theme={theme} title="1. Tìm kiếm" desc="Chọn chuyên khoa, bác sĩ hoặc cơ sở y tế." />
            </Col>
            <Col xs={24} md={6}>
              <Step theme={theme} title="2. Chọn thời gian" desc="Xem lịch trống và đặt trong vài giây." />
            </Col>
            <Col xs={24} md={6}>
              <Step theme={theme} title="3. Xác nhận" desc="Đăng nhập, điền thông tin, xác nhận lịch." />
            </Col>
            <Col xs={24} md={6}>
              <Step theme={theme} title="4. Khám & đánh giá" desc="Nhận nhắc lịch và đánh giá dịch vụ." />
            </Col>
          </Row>

          <Divider />

          {isAuthenticated ? (
            <Link to="/my-account">
              <Button type="primary">Quản lý tài khoản</Button>
            </Link>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="primary">Đăng nhập để đặt lịch</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký tài khoản</Button>
              </Link>
            </Space>
          )}
        </Card>
      </div>
    </div>
  );
};


/* ✅ COMPONENTS — support dark mode */

const FeatureMini = ({
  icon,
  title,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  theme: string;
}) => (
  <Card
    className={`transition ${
      theme === "dark" ? "!bg-[#152238] !border-white/10 !text-white" : ""
    }`}
    style={{ borderRadius: 12 }}
    bodyStyle={{ display: "flex", alignItems: "center", gap: 12 }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        background: theme === "dark" ? "rgba(96,165,250,0.15)" : "#eff6ff",
        color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
        fontSize: 18,
      }}
    >
      {icon}
    </div>
    <Typography.Text className={theme === "dark" ? "!text-gray-100" : ""}>
      {title}
    </Typography.Text>
  </Card>
);

const FeatureCard = ({
  icon,
  title,
  desc,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  theme: string;
}) => (
  <Card
    className={`transition ${
      theme === "dark" ? "!bg-[#0f1b2d] !border-white/10 !text-white" : ""
    }`}
    style={{ borderRadius: 16, height: "100%" }}
  >
    <Space direction="vertical" size={8}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: theme === "dark" ? "rgba(96,165,250,0.15)" : "#eef2ff",
          color: theme === "dark" ? "#60a5fa" : "#4f46e5",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <Typography.Title
        level={5}
        className={theme === "dark" ? "!text-white" : ""}
        style={{ margin: "8px 0 0" }}
      >
        {title}
      </Typography.Title>
      <Typography.Paragraph
        className={theme === "dark" ? "!text-gray-300" : "!text-gray-600"}
        style={{ margin: 0 }}
      >
        {desc}
      </Typography.Paragraph>
    </Space>
  </Card>
);

const Stats = ({ theme }: { theme: string }) => (
  <Row gutter={[12, 12]}>
    {[
      { label: "Bệnh nhân hài lòng", value: "98%" },
      { label: "Bác sĩ đối tác", value: "> 500" },
      { label: "Thời gian đặt lịch", value: "~ 60s" },
      { label: "Đánh giá 5★", value: "> 10k" },
    ].map((s, i) => (
      <Col span={12} key={i}>
        <Card
          className={`transition text-center ${
            theme === "dark" ? "!bg-[#152238] !border-white/10 !text-white" : ""
          }`}
          style={{ borderRadius: 12 }}
        >
          <Typography.Title
            level={4}
            className={theme === "dark" ? "!text-white" : ""}
            style={{ margin: 0 }}
          >
            {s.value}
          </Typography.Title>
          <Typography.Text
            className={theme === "dark" ? "!text-gray-300" : ""}
          >
            {s.label}
          </Typography.Text>
        </Card>
      </Col>
    ))}
  </Row>
);

const Step = ({
  title,
  desc,
  theme,
}: {
  title: string;
  desc: string;
  theme: string;
}) => (
  <Card
    className={`transition ${
      theme === "dark" ? "!bg-[#152238] !border-white/10 !text-white" : ""
    }`}
    style={{ borderRadius: 12, height: "100%" }}
  >
    <Typography.Text
      strong
      className={theme === "dark" ? "!text-white" : ""}
    >
      {title}
    </Typography.Text>
    <Typography.Paragraph
      style={{ marginTop: 6 }}
      className={theme === "dark" ? "!text-gray-300" : "!text-gray-600"}
    >
      {desc}
    </Typography.Paragraph>
  </Card>
);

export default AboutPage;
