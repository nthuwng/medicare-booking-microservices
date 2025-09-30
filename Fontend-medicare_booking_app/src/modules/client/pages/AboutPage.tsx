import React from "react";
import { Card, Col, Row, Typography, Space, Tag, Button, Divider } from "antd";
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
  const { isAuthenticated } = useCurrentApp();
  return (
    <div
      style={{
        background: "#f9fafb",
      }}
    >
      {/* Hero */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 16px 24px",
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Tag color="blue" style={{ alignSelf: "flex-start" }}>
                Medicare Booking
              </Tag>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Đặt lịch khám bệnh trực tuyến nhanh, tiện lợi, minh bạch
              </Typography.Title>
              <Typography.Paragraph
                style={{ color: "#64748b", fontSize: 16, marginTop: 4 }}
              >
                Nền tảng giúp bệnh nhân tìm bác sĩ phù hợp, chọn cơ sở y tế gần
                bạn, đặt lịch chỉ trong vài bước. Theo dõi lịch, nhận thông báo
                và quản lý hồ sơ khám chữa bệnh tập trung.
              </Typography.Paragraph>
              <Space size={12} wrap>
                <Link to="/booking-options">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                  >
                    Bắt đầu đặt lịch
                  </Button>
                </Link>
              </Space>
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <FeatureMini
                    icon={<ScheduleOutlined />}
                    title="Đặt lịch 24/7"
                  />
                </Col>
                <Col span={12}>
                  <FeatureMini
                    icon={<MobileOutlined />}
                    title="Quản lý trên mobile"
                  />
                </Col>
                <Col span={12}>
                  <FeatureMini
                    icon={<SafetyCertificateOutlined />}
                    title="Bảo mật & riêng tư"
                  />
                </Col>
                <Col span={12}>
                  <FeatureMini
                    icon={<CustomerServiceOutlined />}
                    title="Hỗ trợ nhanh"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Mission */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px 32px" }}
      >
        <Card style={{ borderRadius: 16 }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                Sứ mệnh của chúng tôi
              </Typography.Title>
              <Typography.Paragraph style={{ color: "#475569" }}>
                Medicare Booking ra đời để giảm thời gian chờ, nâng cao trải
                nghiệm khám chữa bệnh và kết nối hiệu quả giữa bệnh nhân – bác
                sĩ – cơ sở y tế. Chúng tôi tập trung vào sự đơn giản, tốc độ và
                độ tin cậy: bệnh nhân đặt lịch trong vài chạm, bác sĩ chủ động
                quản lý lịch, cơ sở dễ dàng điều phối.
              </Typography.Paragraph>
              <Space size={[8, 8]} wrap>
                <Tag>Minh bạch chi phí</Tag>
                <Tag>Nhắc lịch tự động</Tag>
                <Tag>Đánh giá sau khám</Tag>
                <Tag>Hồ sơ sức khỏe</Tag>
              </Space>
            </Col>
            <Col xs={24} md={10}>
              <Stats />
            </Col>
          </Row>
        </Card>
      </div>

      {/* Features */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px 32px" }}
      >
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Tính năng nổi bật
        </Typography.Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <FeatureCard
              icon={<ThunderboltOutlined />}
              title="Đặt lịch siêu nhanh"
              desc="Tìm bác sĩ, chọn khung giờ và xác nhận chỉ trong 60 giây."
            />
          </Col>
          <Col xs={24} md={8}>
            <FeatureCard
              icon={<TeamOutlined />}
              title="Kết nối bác sĩ uy tín"
              desc="Danh mục chuyên khoa rõ ràng, hồ sơ bác sĩ minh bạch."
            />
          </Col>
          <Col xs={24} md={8}>
            <FeatureCard
              icon={<SafetyCertificateOutlined />}
              title="An toàn dữ liệu"
              desc="Mã hóa và kiểm soát truy cập, tôn trọng quyền riêng tư."
            />
          </Col>
        </Row>
      </div>

      {/* How it works */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px 56px" }}
      >
        <Card style={{ borderRadius: 16 }}>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            Quy trình đặt lịch
          </Typography.Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Step
                title="1. Tìm kiếm"
                desc="Chọn chuyên khoa, bác sĩ hoặc cơ sở y tế phù hợp."
              />
            </Col>
            <Col xs={24} md={6}>
              <Step
                title="2. Chọn thời gian"
                desc="Xem lịch trống và chọn khung giờ mong muốn."
              />
            </Col>
            <Col xs={24} md={6}>
              <Step
                title="3. Xác nhận"
                desc="Đăng nhập/đăng ký, điền thông tin cần thiết và xác nhận."
              />
            </Col>
            <Col xs={24} md={6}>
              <Step
                title="4. Khám & đánh giá"
                desc="Nhận nhắc lịch, tới khám và đánh giá sau dịch vụ."
              />
            </Col>
          </Row>
          <Divider />
          {isAuthenticated === false ? (
            <Space>
              <Link to="/login">
                <Button type="primary">Đăng nhập để đặt lịch</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký tài khoản</Button>
              </Link>
            </Space>
          ) : (
            <Space>
              <Link to="/my-account">
                <Button type="primary">Quản lý tài khoản</Button>
              </Link>
            </Space>
          )}
        </Card>
      </div>
    </div>
  );
};

const FeatureMini = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <Card
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
        background: "#eff6ff",
        color: "#1d4ed8",
        fontSize: 18,
      }}
    >
      {icon}
    </div>
    <Typography.Text strong>{title}</Typography.Text>
  </Card>
);

const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <Card style={{ borderRadius: 16, height: "100%" }}>
    <Space direction="vertical" size={8}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "#eef2ff",
          color: "#4f46e5",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <Typography.Title level={5} style={{ margin: "8px 0 0" }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph style={{ color: "#64748b", margin: 0 }}>
        {desc}
      </Typography.Paragraph>
    </Space>
  </Card>
);

const Stats = () => (
  <Row gutter={[12, 12]}>
    <Col span={12}>
      <StatItem label="Bệnh nhân hài lòng" value="98%" />
    </Col>
    <Col span={12}>
      <StatItem label="Bác sĩ đối tác" value="> 500" />
    </Col>
    <Col span={12}>
      <StatItem label="Thời gian đặt lịch" value="~ 60s" />
    </Col>
    <Col span={12}>
      <StatItem label="Đánh giá 5★" value="> 10k" />
    </Col>
  </Row>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <Card style={{ borderRadius: 12, textAlign: "center" }}>
    <Typography.Title level={4} style={{ margin: 0 }}>
      {value}
    </Typography.Title>
    <Typography.Text type="secondary">{label}</Typography.Text>
  </Card>
);

const Step = ({ title, desc }: { title: string; desc: string }) => (
  <Card style={{ borderRadius: 12, height: "100%" }}>
    <Typography.Text strong>{title}</Typography.Text>
    <Typography.Paragraph style={{ color: "#64748b", marginTop: 6 }}>
      {desc}
    </Typography.Paragraph>
  </Card>
);

export default AboutPage;
