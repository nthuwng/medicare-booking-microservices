import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Tag,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Spin,
  Empty,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  TrophyOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/contexts/app.context";
import { FaTransgender } from "react-icons/fa6";
import { Award, MapPin, Building2 } from "lucide-react";
import { getDoctorProfileByUserId } from "../../services/doctor.api";
import type { IDoctorProfile } from "@/types";
import DoctorProFileCreate from "./DoctorProFileCreate";

const { Title, Text, Paragraph } = Typography;

const DoctorProFile = () => {
  const [doctorProfile, setDoctorProfile] = useState<IDoctorProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentApp();
  const [openCreate, setOpenCreate] = useState(false);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDoctorProfileByUserId(user?.id as string);
      if (res?.data) setDoctorProfile(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchDoctorProfile();
  }, [user?.id, fetchDoctorProfile]);

  useEffect(() => {
    const handler = () => { fetchDoctorProfile(); };
    window.addEventListener("doctor:profile-refresh", handler);
    return () => window.removeEventListener("doctor:profile-refresh", handler);
  }, [fetchDoctorProfile]);

  if (loading) {
    return (
      <div className="h-fullbg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  const renderTitleTag = (title: IDoctorProfile["title"]) => {
    switch (title) {
      case "BS":
        return (
          <Tag color="blue" className="px-3 py-1 text-sm font-medium">
            Bác sĩ
          </Tag>
        );
      case "ThS":
        return (
          <Tag color="green" className="px-3 py-1 text-sm font-medium">
            Thạc sĩ
          </Tag>
        );
      case "TS":
        return (
          <Tag color="purple" className="px-3 py-1 text-sm font-medium">
            Tiến sĩ
          </Tag>
        );
      case "PGS":
        return (
          <Tag color="orange" className="px-3 py-1 text-sm font-medium">
            Phó Giáo sư
          </Tag>
        );
      case "GS":
        return (
          <Tag color="red" className="px-3 py-1 text-sm font-medium">
            Giáo sư
          </Tag>
        );
      default:
        return <Tag className="px-3 py-1 text-sm font-medium">{title}</Tag>;
    }
  };

  const cityMap = {
    HoChiMinh: "Hồ Chí Minh",
    HaNoi: "Hà Nội",
  };

  const getFullCityName = (cityCode: string) =>
    cityMap[cityCode as keyof typeof cityMap] || cityCode;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div>
        {doctorProfile ? (
          doctorProfile.approvalStatus === "Approved" ? (
            <>
              <Card className="relative bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <Row gutter={24} align="middle">
                  <Col
                    xs={24}
                    lg={24}
                    className="text-center md:text-left"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      size={104}
                      src={doctorProfile.avatarUrl || undefined}
                      style={{
                        backgroundImage: !doctorProfile.avatarUrl
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
                      {!doctorProfile.avatarUrl &&
                        doctorProfile.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Col>
                  <Col
                    xs={24}
                    lg={24}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div className="text-center md:text-left">
                      <Title level={2} className="text-blue-600 mb-2">
                        {doctorProfile.fullName}
                      </Title>

                      <div className="mb-3 flex flex-col md:flex-row gap-4 text-sm text-gray-600">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Award size={16} color="#8c8c8c" />
                          <Text strong>Học vị:</Text>
                          {renderTitleTag(doctorProfile.title)}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <FaTransgender size={16} color="#8c8c8c" />
                          <Text strong>Giới tính:</Text>
                          {doctorProfile.gender === "Male" ? (
                            <Tag color="blue">Nam</Tag>
                          ) : doctorProfile.gender === "Female" ? (
                            <Tag color="pink">Nữ</Tag>
                          ) : (
                            <Tag>Khác</Tag>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MailOutlined className="mr-2" />
                          <span>{doctorProfile.userInfo.email}</span>
                        </div>
                        <div className="flex items-center">
                          <PhoneOutlined className="mr-2" />
                          <span>{doctorProfile.phone}</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Stats Cards */}
              <Row gutter={[16, 16]} className="mb-8 mt-8">
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      156
                    </div>
                    <Text className="text-gray-600 font-medium">
                      Bệnh nhân đã điều trị
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      4.8
                    </div>
                    <Text className="text-gray-600 font-medium">Rating</Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {doctorProfile.experienceYears}
                    </div>
                    <Text className="text-gray-600 font-medium">
                      Năm kinh nghiệm
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(doctorProfile.bookingFee)}
                    </div>
                    <Text className="text-gray-600 font-medium">Giá khám</Text>
                  </Card>
                </Col>
              </Row>

              {/* Detailed Information */}
              <Row gutter={[24, 24]}>
                {/* Bio Section */}
                <Col span={24}>
                  <Card
                    title={
                      <div className="flex items-center">
                        <UserOutlined className="mr-2 text-blue-600" />
                        <span className="text-lg font-semibold">
                          Giới thiệu
                        </span>
                      </div>
                    }
                    className="shadow-lg border-0 rounded-xl"
                    headStyle={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "20px 24px",
                    }}
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Paragraph className="text-gray-700 leading-relaxed text-base">
                      {doctorProfile.bio}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Specialty Information */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div className="flex items-center">
                        <TrophyOutlined className="mr-2 text-green-600" />
                        <span className="text-lg font-semibold">
                          Thông tin chuyên khoa
                        </span>
                      </div>
                    }
                    className="shadow-lg border-0 rounded-xl h-full"
                    headStyle={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "20px 24px",
                    }}
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-green-700">
                          Chuyên ngành
                        </Text>
                        <Text className="text-gray-700 font-medium">
                          {doctorProfile.specialty.specialtyName}
                        </Text>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-blue-700">
                          Mô tả chuyên khoa
                        </Text>
                        <Text className="text-gray-700">
                          {doctorProfile.specialty.description}
                        </Text>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-purple-700">
                          Hình ảnh chuyên khoa
                        </Text>
                        <Text className="text-gray-700">
                          {doctorProfile.specialty.iconPath}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Clinic Information */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div className="flex items-center">
                        <Building2 className="mr-2 text-orange-600" size={20} />
                        <span className="text-lg font-semibold">
                          Thông tin phòng khám
                        </span>
                      </div>
                    }
                    className="shadow-lg border-0 rounded-xl h-full"
                    headStyle={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "20px 24px",
                    }}
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-orange-700">
                          Tên phòng khám
                        </Text>
                        <Text className="text-gray-700 font-medium">
                          {doctorProfile.clinic.clinicName}
                        </Text>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-red-700">
                          <MapPin className="inline mr-1" size={16} />
                          Địa chỉ
                        </Text>
                        <Text className="text-gray-700">
                          {`${doctorProfile.clinic.street}, ${
                            doctorProfile.clinic.district
                          }, ${getFullCityName(doctorProfile.clinic.city)}`}
                        </Text>
                      </div>

                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg">
                        <Text strong className="block mb-2 text-teal-700">
                          <PhoneOutlined className="mr-1" />
                          Số điện thoại phòng khám
                        </Text>
                        <Text className="text-gray-700 font-medium">
                          {doctorProfile.phone}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Quick Actions */}
                <Col span={24}>
                  <Card
                    title={
                      <div className="flex items-center">
                        <SafetyCertificateOutlined className="mr-2 text-indigo-600" />
                        <span className="text-lg font-semibold">
                          Thao tác nhanh
                        </span>
                      </div>
                    }
                    className="shadow-lg border-0 rounded-xl"
                    headStyle={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "20px 24px",
                    }}
                    bodyStyle={{ padding: "24px" }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Button
                          block
                          icon={<CalendarOutlined />}
                          className="h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
                          style={{
                            border: "2px solid #10b981",
                            color: "#10b981",
                          }}
                        >
                          Xem lịch làm việc
                        </Button>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Button
                          block
                          icon={<StarOutlined />}
                          className="h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
                          style={{
                            border: "2px solid #f59e0b",
                            color: "#f59e0b",
                          }}
                        >
                          Xem đánh giá
                        </Button>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Button
                          block
                          icon={<BookOutlined />}
                          className="h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
                          style={{
                            border: "2px solid #8b5cf6",
                            color: "#8b5cf6",
                          }}
                        >
                          Xem chứng chỉ
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <div className="min-h-[84vh] flex items-center justify-center">
              <Card className="w-full max-w-xl border rounded-xl shadow-sm">
                <div className="p-8 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={false}
                  />
                  <Title level={4} className="mt-4 mb-1">
                    Hồ sơ đang chờ duyệt
                  </Title>
                  <Text type="secondary">
                    Hồ sơ của bạn có trạng thái:{" "}
                    <Tag
                      color={
                        doctorProfile.approvalStatus === "Rejected"
                          ? "red"
                          : "gold"
                      }
                    >
                      {doctorProfile.approvalStatus}
                    </Tag>
                  </Text>
                  {doctorProfile.approvalStatus === "Rejected" && (
                    <div className="mt-4">
                      <Text type="secondary">
                        Vui lòng cập nhật lại thông tin và gửi yêu cầu duyệt.
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )
        ) : (
          <div className="min-h-[84vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8">
            <Empty description={null} />
            <Text
              className=" font-semibold text-gray-700 mt-4 mb-3"
              style={{ fontSize: "25px" }}
            >
              Không có hồ sơ bác sĩ
            </Text>
            <Text
              className="text-base text-gray-500 mb-3"
              style={{ fontSize: "20px" }}
            >
              Bạn chưa có hồ sơ. Hãy tạo hồ sơ để bắt đầu sử dụng các tính năng
              dành cho bác sĩ.
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => setOpenCreate(true)}
              style={{ fontSize: "20px" }}
              className="!w-fit !h-fit"
            >
              Tạo hồ sơ ngay
            </Button>
          </div>
        )}
      </div>

      <DoctorProFileCreate
        openCreate={openCreate}
        setOpenCreate={setOpenCreate}
        fetchDoctorProfile={fetchDoctorProfile}
      />
    </div>
  );
};

export default DoctorProFile;
