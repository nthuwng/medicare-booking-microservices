import type { IDoctorProfile } from "@/types";
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
  Award,
  Stethoscope,
  MapPin,
  ClipboardList,
  CalendarCheck,
} from "lucide-react";
import dayjs from "dayjs";
import { FaTransgender } from "react-icons/fa";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  dataViewDetail: IDoctorProfile | null;
  setDataViewDetail: (v: IDoctorProfile | null) => void;
}

const DoctorDetail = (props: IProps) => {
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

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "PENDING":
        return "orange";
      case "REJECTED":
        return "red";
      default:
        return "default";
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Đã duyệt";
      case "PENDING":
        return "Chờ duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const renderTitleTag = (title: IDoctorProfile["title"]) => {
    switch (title) {
      case "BS":
        return <Tag color="blue">Bác sĩ</Tag>;
      case "ThS":
        return <Tag color="green">Thạc sĩ</Tag>;
      case "TS":
        return <Tag color="purple">Tiến sĩ</Tag>;
      case "PGS":
        return <Tag color="orange">Phó Giáo sư</Tag>;
      case "GS":
        return <Tag color="red">Giáo sư</Tag>;
      default:
        return <Tag>{title}</Tag>;
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Stethoscope size={20} />
          <span>Chi tiết bác sĩ</span>
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
                    src={dataViewDetail.avatarUrl || undefined}
                    style={{
                      backgroundImage: !dataViewDetail.avatarUrl
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
                    {!dataViewDetail.avatarUrl &&
                      dataViewDetail.fullName?.charAt(0).toUpperCase()}
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
                    {dataViewDetail.fullName}
                  </Title>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "16px",
                      color: "#595959",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "4px",
                        height: "16px",
                        backgroundColor: "#1890ff",
                        borderRadius: "2px",
                      }}
                    />
                    {dataViewDetail.specialty?.specialtyName}
                  </Text>
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    <Tag
                      color={getApprovalStatusColor(
                        dataViewDetail.approvalStatus
                      )}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontWeight: "500",
                        fontSize: "13px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {getApprovalStatusText(dataViewDetail.approvalStatus)}
                    </Tag>
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

          {/* Bio/About Section */}
          {dataViewDetail.bio && (
            <Card
              title={
                <Space style={{ color: "#1890ff" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #40a9ff, #1890ff)",
                      borderRadius: "6px",
                      padding: "4px",
                      display: "flex",
                    }}
                  >
                    <ClipboardList size={16} color="white" />
                  </div>
                  <span style={{ fontWeight: 600, color: "#262626" }}>
                    Giới thiệu
                  </span>
                </Space>
              }
              style={{
                marginBottom: "24px",
                borderRadius: "12px",
                border: "1px solid #e6f7ff",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.1)",
              }}
              headStyle={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
                borderBottom: "1px solid #bae7ff",
              }}
            >
              <Paragraph style={{ lineHeight: "1.8", color: "#595959" }}>
                {dataViewDetail.bio}
              </Paragraph>
            </Card>
          )}

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
                    <Award size={16} color="#8c8c8c" />
                    <Text strong>Học vị:</Text>
                    {renderTitleTag(dataViewDetail.title)}
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Professional Information */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    background: "linear-gradient(135deg, #13c2c2, #08979c)",
                    borderRadius: "6px",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  <Stethoscope size={16} color="white" />
                </div>
                <span style={{ fontWeight: 600, color: "#262626" }}>
                  Thông tin chuyên môn
                </span>
              </Space>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              border: "1px solid #e6fffb",
              boxShadow: "0 2px 8px rgba(19, 194, 194, 0.1)",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #f0fdff 0%, #e6fffb 100%)",
              borderBottom: "1px solid #87e8de",
            }}
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <Stethoscope
                    size={16}
                    color="#8c8c8c"
                    style={{ marginTop: "2px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>Chuyên khoa:</Text>
                    <br />
                    <Text>{dataViewDetail.specialty?.specialtyName}</Text>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <Award
                    size={16}
                    color="#8c8c8c"
                    style={{ marginTop: "2px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>Mô tả chuyên khoa:</Text>
                    <br />
                    <Text>{dataViewDetail.specialty?.description}</Text>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <Award
                    size={16}
                    color="#8c8c8c"
                    style={{ marginTop: "2px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>Kinh nghiệm:</Text>
                    <br />
                    <Text>{dataViewDetail.experienceYears} năm</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <MapPin
                    size={16}
                    color="#8c8c8c"
                    style={{ marginTop: "2px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>Phòng khám:</Text>
                    <br />
                    <Text>{dataViewDetail.clinic?.clinicName}</Text>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <MapPin
                    size={16}
                    color="#8c8c8c"
                    style={{ marginTop: "2px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>Địa chỉ:</Text>
                    <br />
                    <Text style={{ wordBreak: "break-word" }}>
                      {dataViewDetail.clinic?.street},{" "}
                      {dataViewDetail.clinic?.district},{" "}
                      {dataViewDetail.clinic?.city}
                    </Text>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <MapPin
                    size={16}
                    color="#8c8c8c"
                    style={{ marginTop: "2px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>Số điện thoại phòng khám:</Text>
                    <br />
                    <Text>
                      {dataViewDetail.clinic?.phone
                        ? dataViewDetail.clinic?.phone
                        : "Không có"}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Financial Information */}
          <Card
            title={
              <Space>
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffa940, #fa8c16)",
                    borderRadius: "6px",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  <Award size={16} color="white" />
                </div>
                <span style={{ fontWeight: 600, color: "#262626" }}>
                  Thông tin phí khám
                </span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid #fff7e6",
              boxShadow: "0 2px 8px rgba(250, 140, 22, 0.1)",
            }}
            headStyle={{
              background: "linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)",
              borderBottom: "1px solid #ffd591",
            }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Text strong>Phí tư vấn:</Text>
                  <Text>
                    {parseFloat(
                      dataViewDetail.consultationFee.toString()
                    ).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Text strong>Phí đặt lịch:</Text>
                  <Text>
                    {parseFloat(
                      dataViewDetail.bookingFee.toString()
                    ).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </Text>
                </div>
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
                    {dayjs(dataViewDetail.createdAt).format("DD/MM/YYYY HH:mm")}
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

export default DoctorDetail;
