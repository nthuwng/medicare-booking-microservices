import type { IDoctorProfile } from "@/types";

import { Card, Typography, Avatar, Space, Tag, Divider } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  StarFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface IProps {
  doctor: IDoctorProfile;
}

const DoctorInfoCard = (props: IProps) => {
  const { doctor } = props;

  return (
    <>
      <Card
        style={{
          borderRadius: "12px",
          border: "1px solid #e8f4f8",
          position: "sticky",
          top: "24px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <Tag color="orange" style={{ marginBottom: "12px" }}>
            ĐẶT LỊCH KHÁM
          </Tag>
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {doctor.fullName}
          </Title>
        </div>

        {/* Doctor Avatar & Basic Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Avatar
            size={64}
            src={doctor.avatarUrl}
            style={{ marginRight: "12px" }}
            icon={<UserOutlined />}
          />
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <StarFilled style={{ color: "#faad14", marginRight: "4px" }} />
              <Text strong>4.8</Text>
              <Text type="secondary" style={{ marginLeft: "8px" }}>
                {doctor.experienceYears}+ năm kinh nghiệm
              </Text>
            </div>
            <Text type="secondary">
              {doctor.specialty?.specialtyName || "Chuyên khoa"}
            </Text>
          </div>
        </div>

        {/* Schedule Info */}
        <div
          style={{
            backgroundColor: "#fff7e6",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #ffd591",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined
              style={{ color: "#fa8c16", marginRight: "8px" }}
            />
            <Text strong>Thứ 2 - Chủ nhật</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ color: "#fa8c16", marginRight: "8px" }}
            />
            <Text strong>8:00 - 17:00</Text>
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "8px",
            }}
          >
            <EnvironmentOutlined
              style={{
                color: "#52c41a",
                marginRight: "8px",
                marginTop: "2px",
              }}
            />
            <Text strong style={{ color: "#52c41a" }}>
              {doctor.clinic?.clinicName || "Phòng khám"}
            </Text>
          </div>
          <Text
            type="secondary"
            style={{ fontSize: "14px", lineHeight: "1.5" }}
          >
            {doctor.clinic
              ? `${doctor.clinic.street}, ${
                  doctor.clinic.district
                }, ${doctor.clinic.city
                  .replace("HoChiMinh", "Hồ Chí Minh")
                  .replace("HaNoi", "Hà Nội")}`
              : "Địa chỉ phòng khám"}
          </Text>
        </div>

        {/* Price */}
        <div
          style={{
            backgroundColor: "#f6ffed",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #b7eb8f",
            marginBottom: "16px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
              💰 Chi phí khám bệnh
            </Text>
          </div>

          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Phí khám:</Text>
              <Text strong style={{ color: "#52c41a" }}>
                {Number(doctor.consultationFee) > 0
                  ? `${Number(doctor.consultationFee)?.toLocaleString()}đ`
                  : "Miễn phí"}
              </Text>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>Phí đặt lịch:</Text>
              <Text strong style={{ color: "#52c41a" }}>
                {Number(doctor.bookingFee)?.toLocaleString()}đ
              </Text>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: "16px" }}>
                Tổng cộng:
              </Text>
              <Text strong style={{ fontSize: "18px", color: "#52c41a" }}>
                {(
                  Number(doctor.consultationFee) + Number(doctor.bookingFee)
                )?.toLocaleString()}
                đ
              </Text>
            </div>
          </Space>
        </div>

        <Divider />

        {/* Payment Info */}
        <div style={{ textAlign: "center" }}>
          <Text
            strong
            style={{
              color: "#1890ff",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Hình thức thanh toán
          </Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SafetyCertificateOutlined
              style={{
                color: "#52c41a",
                marginRight: "4px",
              }}
            />
            <Text>Thanh toán sau tại cơ sở y tế</Text>
          </div>
        </div>
      </Card>
    </>
  );
};

export default DoctorInfoCard;
