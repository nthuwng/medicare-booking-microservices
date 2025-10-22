import { useState, useEffect } from "react";
import {
  Avatar,
  Typography,
  Button,
  Rate,
  Card,
  Row,
  Col,
  Breadcrumb,
  Spin,
  message,
  Divider,
  List,
  Empty,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  HomeOutlined,
  RightOutlined,
  EnvironmentOutlined,
  StarFilled,
  ShareAltOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import type { IDoctorProfile } from "@/types";
import {
  getDoctorDetailBookingById,
  getRatingByDoctorIdAPI,
} from "../../services/client.api";
import type { IRating, IRatingStats } from "@/types/rating";

const { Title, Text } = Typography;

const DoctorDetailPage = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<IDoctorProfile | null>(null);
  const [rating, setRating] = useState<IRating[]>([]);
  const [ratingStats, setRatingStats] = useState<IRatingStats | null>(null);

  const fetchDoctorDetail = async () => {
    if (!doctorId) return;

    setLoading(true);
    try {
      // Tạm thời sử dụng API hiện có để lấy thông tin bác sĩ
      const response = await getDoctorDetailBookingById(doctorId);
      if (response.data) {
        setDoctor(response.data);
      }
    } catch (error) {
      console.error("Error fetching doctor detail:", error);
      message.error("Không thể tải thông tin bác sĩ");
      navigate("/booking/doctor");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingByDoctorId = async () => {
    if (!doctorId) return;
    const response = await getRatingByDoctorIdAPI(doctorId);
    const data = response.data;
    setRating(data?.ratings || []);
    setRatingStats(data?.ratingStats || null);
  };

  useEffect(() => {
    fetchDoctorDetail();
    fetchRatingByDoctorId();
  }, [doctorId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    const d = dayjs(isoString);
    if (!d.isValid()) return isoString;
    return d.locale("vi").format("DD/MM/YYYY HH:mm");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={<RightOutlined className="text-gray-400" />}
            className="text-sm"
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className="!p-0 !h-auto !text-gray-600 hover:!text-blue-600"
                icon={<HomeOutlined />}
              >
                Trang chủ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/booking-options")}
                className="!p-0 !h-auto !text-gray-600 hover:!text-blue-600"
              >
                Hình thức đặt lịch
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/booking-options/doctor")}
                className="!p-0 !h-auto !text-gray-600 hover:!text-blue-600"
              >
                Tìm bác sĩ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="text-blue-600 font-medium">
              {doctor.title} {doctor.fullName}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={[32, 32]}>
          {/* Left Column - Doctor Info */}
          <Col xs={24} lg={16}>
            {/* Doctor Profile Section */}
            <Card className="mb-6 border-0 shadow-sm">
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar
                    size={120}
                    src={doctor.avatarUrl || undefined}
                    style={{
                      backgroundImage: !doctor.avatarUrl
                        ? "linear-gradient(135deg, #1890ff, #096dd9)"
                        : undefined,
                      color: "#fff",
                      fontSize: "48px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "4px solid #ffffff",
                      boxShadow: "0 8px 25px rgba(24, 144, 255, 0.25)",
                    }}
                  >
                    {!doctor.avatarUrl &&
                      doctor.fullName?.charAt(0).toUpperCase()}
                  </Avatar>
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <Title level={2} className="!mb-3 !text-gray-800">
                    {doctor.title} {doctor.fullName}
                  </Title>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserOutlined />
                      <span>
                        Hơn {doctor.experienceYears} năm kinh nghiệm khám các
                        vấn đề sức khỏe
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvironmentOutlined />
                      <span>Từng công tác tại {doctor.clinic.clinicName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvironmentOutlined />
                      <span>
                        Từng tu nghiệp tại nước ngoài: Singapore, Hoa Kì
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvironmentOutlined />
                      <span>{doctor.clinic.city}</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<ShareAltOutlined />}
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                    >
                      Chia sẻ
                    </Button>
                    <Button
                      type="primary"
                      icon={<MessageOutlined />}
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                      onClick={() =>
                        navigate("/message", { state: { doctorId } })
                      }
                    >
                      Tin nhắn
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            {/* Doctor Services Section */}
            <Card className="border-0 shadow-sm">
              <Title level={3} className="!mb-4 !text-gray-800">
                {doctor.title} {doctor.fullName}
              </Title>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserOutlined />
                  <span>
                    Hơn {doctor.experienceYears} năm kinh nghiệm khám các vấn đề
                    sức khỏe
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvironmentOutlined />
                  <span>Từng công tác tại {doctor.clinic.clinicName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvironmentOutlined />
                  <span>Bác sĩ nhận khám mọi độ tuổi</span>
                </div>
              </div>

              <Title level={4} className="!mb-3 !text-gray-800">
                Khám và điều trị
              </Title>

              <div className="space-y-3 text-gray-600">
                <div>
                  • Phẫu thuật điều trị các bệnh lý cột sống – tủy sống: thoát
                  vị đĩa đệm cột sống cổ, cột sống lưng; hẹp ống sống cổ, ống
                  sống thắt lưng; u tủy sống, lao cột sống; cordoma; viêm dính
                  khớp dạng thấp cột sống; trượt đốt sống thắt lưng,...
                </div>
                <div>• Tạo hình thân sống bằng cement sinh học</div>
                <div>
                  • Phẫu thuật các bệnh lý về não: u não giãn não thất túi phình
                  mạch máu não di dạng mạch máu não xuất huyết não chấn thương
                  sọ não
                </div>
              </div>
            </Card>
            <Card className="border-0 shadow-sm mt-6">
              <Title level={4} className="!mb-3 !text-gray-800">
                Đánh giá của bệnh nhân
              </Title>

              <div className="flex items-center gap-2 mb-3">
                <Rate
                  disabled
                  allowHalf
                  value={
                    ratingStats?.avgScore ? Number(ratingStats.avgScore) : 0
                  }
                  character={<StarFilled />}
                />
                <Text className="font-medium">{ratingStats?.avgScore}</Text>
                <Text className="text-gray-500">
                  ({ratingStats?.totalReviews} đánh giá)
                </Text>
              </div>

              {rating?.length === 0 ? (
                <Empty
                  description="Chưa có đánh giá"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={rating}
                  renderItem={(item: IRating) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar>
                            {item.userProfile?.full_name
                              ? item.userProfile.full_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}
                          </Avatar>
                        }
                        title={
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">
                              {item.userProfile.full_name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        }
                        description={
                          <div>
                            <Rate
                              disabled
                              allowHalf
                              value={item.score}
                              character={<StarFilled />}
                              className="!text-[15px]"
                            />
                            {item.content && (
                              <div className="text-gray-600 mt-1 !text-[16px]">
                                {item.content}
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* Right Column - Booking Section */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              {/* Clinic Address */}
              <Card className="border-0 shadow-sm">
                <Title level={4} className="!mb-3 !text-gray-800">
                  ĐỊA CHỈ KHÁM
                </Title>

                <div className="space-y-3">
                  <div className="text-blue-600 font-medium">
                    {doctor.clinic.clinicName}
                  </div>
                  <div className="text-gray-600">
                    {doctor.clinic.street}, {doctor.clinic.district},{" "}
                    {doctor.clinic.city}
                  </div>
                </div>
              </Card>

              {/* Pricing */}
              <Card className="border-0 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Text className="text-gray-600">GIÁ KHÁM:</Text>
                      <Text className="font-semibold text-blue-600 text-lg">
                        {formatCurrency(Number(doctor.bookingFee))}
                      </Text>
                    </div>
                    <Button type="link" className="!p-0 !h-auto text-blue-600">
                      Xem chi tiết
                    </Button>
                  </div>

                  <Divider className="!my-2" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Text className="text-gray-600">
                        LOẠI BẢO HIỂM ÁP DỤNG.
                      </Text>
                    </div>
                    <Button type="link" className="!p-0 !h-auto text-blue-600">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Rating summary */}
              <Card className="border-0 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Rate
                    disabled
                    allowHalf
                    value={Number(ratingStats?.avgScore || 0)}
                    character={<StarFilled />}
                  />
                  <Text className="font-medium">
                    {ratingStats?.avgScore ?? "0.0"}
                  </Text>
                  <Text className="text-gray-500">
                    ({ratingStats?.totalReviews ?? 0} đánh giá)
                  </Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
