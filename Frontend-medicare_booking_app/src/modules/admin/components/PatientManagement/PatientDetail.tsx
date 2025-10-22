import type { IPatientProfile } from "@/types";
import {
  Avatar,
  Card,
  Tag,
  Row,
  Col,
  Typography,
  Space,
  Drawer,
  Empty,
  Divider,
} from "antd";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CalendarCheck,
  MapPin,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaTransgender } from "react-icons/fa";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  dataViewDetail: IPatientProfile | null;
  setDataViewDetail: (v: IPatientProfile | null) => void;
}

const PatientDetail = (props: IProps) => {
  const {
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
    setDataViewDetail,
  } = props;

  const onClose = () => {
    setOpenViewDetail(false);
    setDataViewDetail(null);
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <User size={20} />
          <span>Chi tiết bệnh nhân</span>
        </div>
      }
      width="40vw"
      onClose={onClose}
      open={openViewDetail}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "16px",
        },
        body: {
          padding: "16px 24px", // More consistent padding
        },
      }}
    >
      {dataViewDetail ? (
        <div>
          {/* Header Section */}
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f0f0f0",
              background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
              overflow: "hidden",
            }}
          >
            <Row gutter={24} align="middle" style={{ padding: "8px 0" }}>
              <Col>
                <div style={{ position: "relative" }}>
                  <Avatar
                    size={104}
                    src={dataViewDetail.avatar_url || undefined}
                    style={{
                      backgroundImage: !dataViewDetail.avatar_url
                        ? "linear-gradient(135deg, #1890ff, #096dd9)"
                        : undefined,
                      color: "#fff",
                      fontSize: "42px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "4px solid #ffffff",
                      boxShadow: "0 6px 20px rgba(24, 144, 255, 0.25)",
                    }}
                  >
                    {!dataViewDetail.avatar_url &&
                      dataViewDetail.full_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  {/* Online status indicator */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: dataViewDetail.userInfo.isActive
                        ? "#52c41a"
                        : "#ff4d4f",
                      border: "3px solid #ffffff",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                </div>
              </Col>
              <Col flex="1">
                <div style={{ padding: "8px 0" }}>
                  <Title
                    level={3}
                    style={{
                      margin: "0 0 8px 0",
                      color: "#262626",
                      fontWeight: "600",
                      fontSize: "24px",
                    }}
                  >
                    {dataViewDetail.full_name}
                  </Title>
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    <Tag
                      color={dataViewDetail.userInfo.isActive ? "green" : "red"}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontWeight: "500",
                        fontSize: "13px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {dataViewDetail.userInfo.isActive
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
          {/* Personal Information */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    background: "linear-gradient(135deg, #73d13d, #52c41a)",
                    borderRadius: "6px",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  <User size={16} color="white" />
                </div>
                <span style={{ fontWeight: 600, color: "#262626" }}>
                  Thông tin cá nhân
                </span>
              </Space>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              border: "1px solid #f6ffed",
              boxShadow: "0 2px 8px rgba(82, 196, 26, 0.1)",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #fcffe6 0%, #f6ffed 100%)",
              borderBottom: "1px solid #d9f7be",
            }}
          >
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <div>
                    <Text
                      strong
                      style={{ minWidth: "120px", display: "inline-block" }}
                    >
                      Mã bác sĩ:
                    </Text>
                    <Text>{dataViewDetail.id}</Text>
                  </div>
                  <div>
                    <Text
                      strong
                      style={{ minWidth: "120px", display: "inline-block" }}
                    >
                      Loại tài khoản:
                    </Text>
                    <Text>{dataViewDetail.userInfo.userType}</Text>
                  </div>
                </Space>
                <Divider style={{ margin: "12px 0" }} />
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Mail size={16} color="#8c8c8c" />
                    <Text strong>Email:</Text>
                    <Text>{dataViewDetail.userInfo?.email}</Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Phone size={16} color="#8c8c8c" />
                    <Text strong>Số điện thoại:</Text>
                    <Text>{dataViewDetail.phone}</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaTransgender size={16} color="#8c8c8c" />
                    <Text strong>Giới tính:</Text>
                    {dataViewDetail.gender === "Male" ? (
                      <Tag color="blue">Nam</Tag>
                    ) : dataViewDetail.gender === "Female" ? (
                      <Tag color="pink">Nữ</Tag>
                    ) : (
                      <Tag>Khác</Tag>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Calendar size={16} color="#8c8c8c" />
                    <Text strong>Ngày sinh:</Text>
                    <Text>
                      {dayjs(dataViewDetail.date_of_birth).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col span={24}>
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <MapPin size={16} color="#8c8c8c" />
                    <Text strong>Địa chỉ:</Text>
                    <Text style={{ wordBreak: "break-word" }}>
                      {dataViewDetail.address}, {dataViewDetail.district},{" "}
                      {dataViewDetail.city}
                    </Text>
                  </div>
                </Space>
                <Divider style={{ margin: "12px 0" }} />
              </Col>
            </Row>
          </Card>

          {/* Audit Information (Created/Updated Dates) */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    background: "linear-gradient(135deg, #b37feb, #722ed1)",
                    borderRadius: "6px",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  <CalendarCheck size={16} color="white" />
                </div>
                <span style={{ fontWeight: 600, color: "#262626" }}>
                  Thông tin hồ sơ
                </span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              border: "1px solid #f9f0ff",
              boxShadow: "0 2px 8px rgba(114, 46, 209, 0.1)",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #fafafa 0%, #f9f0ff 100%)",
              borderBottom: "1px solid #d3adf7",
            }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Text strong>Ngày tạo hồ sơ:</Text>
                  <Text>
                    {dayjs(dataViewDetail.created_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </div>
              </Col>
              {dataViewDetail.userInfo.updatedAt && (
                <Col xs={24} md={12}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Text strong>Cập nhật gần nhất:</Text>
                    <Text>
                      {dayjs(dataViewDetail.userInfo.updatedAt).fromNow()}
                    </Text>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </div>
      ) : (
        <Empty description="Không có dữ liệu bác sĩ để hiển thị." />
      )}
    </Drawer>
  );
};

export default PatientDetail;
