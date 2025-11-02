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
  Divider,
  List,
  Empty,
  App,
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
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import type { IDoctorProfile } from "@/types";
import {
  getDoctorDetailBookingById,
  getRatingByDoctorIdAPI,
} from "../../services/client.api";
import type { IRating, IRatingStats } from "@/types/rating";
import { useCurrentApp } from "@/components/contexts/app.context";

const { Title, Text } = Typography;

const DoctorDetailPage = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<IDoctorProfile | null>(null);
  const [rating, setRating] = useState<IRating[]>([]);
  const [ratingStats, setRatingStats] = useState<IRatingStats | null>(null);
  const { message } = App.useApp();

  // THEME
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";
  const cls = (...x: (string | false | undefined)[]) =>
    x.filter(Boolean).join(" ");
  const pageBg = isDark
    ? "bg-[#0b1220]"
    : "bg-gradient-to-b from-blue-50 to-white";
  const sectionBg = isDark
    ? "!bg-[#0f1b2d] !border-[#1f2a3a]"
    : "!bg-white !border-slate-200";
  const textStrong = isDark ? "!text-gray-100" : "!text-gray-800";
  const textMuted = isDark ? "!text-gray-400" : "!text-gray-600";
  const chipBlue = isDark
    ? "bg-blue-600 hover:bg-blue-600/90 border-blue-600"
    : "bg-blue-600 hover:bg-blue-700 border-blue-600";
  const toHalf = (n: number) => Math.round(n * 2) / 2;

  const fetchDoctorDetail = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const response = await getDoctorDetailBookingById(doctorId);
      if (response.data) setDoctor(response.data);
    } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (iso: string) => {
    const d = dayjs(iso);
    return d.isValid() ? d.locale("vi").format("DD/MM/YYYY HH:mm") : iso;
  };

  if (loading) {
    return (
      <div
        className={cls("min-h-screen flex items-center justify-center", pageBg)}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (!doctor) return null;

  return (
    <div className={cls("min-h-screen doctor-detail", pageBg)}>
      {/* ✅ Style fix riêng cho dark mode: màu sao Rate */}
      {isDark && (
        <style>{`
    /* Ngăn kế thừa màu từ cha (tránh text-yellow làm sai) */
    .doctor-detail .ant-rate {
      color: inherit !important;
    }

    /* Mặc định (zero) = xám */
    .doctor-detail .ant-rate .ant-rate-star,
    .doctor-detail .ant-rate .ant-rate-star-zero .ant-rate-star-first,
    .doctor-detail .ant-rate .ant-rate-star-zero .ant-rate-star-second,
    .doctor-detail .ant-rate .ant-rate-star-zero .ant-rate-star-first .anticon,
    .doctor-detail .ant-rate .ant-rate-star-zero .ant-rate-star-second .anticon {
      color: #475569 !important; /* slate-600 */
    }

    /* FULL: vàng cả hai nửa */
    .doctor-detail .ant-rate .ant-rate-star-full,
    .doctor-detail .ant-rate .ant-rate-star-full .ant-rate-star-first,
    .doctor-detail .ant-rate .ant-rate-star-full .ant-rate-star-second,
    .doctor-detail .ant-rate .ant-rate-star-full .ant-rate-star-first .anticon,
    .doctor-detail .ant-rate .ant-rate-star-full .ant-rate-star-second .anticon {
      color: #FACC15 !important; /* amber-400 */
      filter: drop-shadow(0 0 2px rgba(0,0,0,.25));
    }

    /* HALF: nửa trái (first) vàng, nửa phải (second) xám */
    .doctor-detail .ant-rate .ant-rate-star-half .ant-rate-star-first,
    .doctor-detail .ant-rate .ant-rate-star-half .ant-rate-star-first .anticon {
      color: #FACC15 !important;
      filter: drop-shadow(0 0 2px rgba(0,0,0,.25));
    }
    .doctor-detail .ant-rate .ant-rate-star-half .ant-rate-star-second,
    .doctor-detail .ant-rate .ant-rate-star-half .ant-rate-star-second .anticon {
      color: #475569 !important;
    }
  `}</style>
      )}

      {/* Breadcrumb */}
      <div
        className={cls(
          isDark
            ? "bg-[#0f1b2d] border-b border-[#1f2a3a]"
            : "bg-white border-b"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={
              <RightOutlined
                className={cls(isDark ? "!text-white" : "text-gray-400")}
              />
            }
            className="text-sm"
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className={cls(
                  "!p-0 !h-auto !font-bold",
                  isDark
                    ? "!text-gray-300 hover:!text-blue-400"
                    : "!text-gray-600 hover:!text-blue-600"
                )}
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
                className={cls(
                  "!p-0 !h-auto !font-bold",
                  isDark
                    ? "!text-gray-300 hover:!text-blue-400"
                    : "!text-gray-600 hover:!text-blue-600"
                )}
              >
                Hình thức đặt lịch
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/booking-options/doctor")}
                className={cls(
                  "!p-0 !h-auto !font-bold",
                  isDark
                    ? "!text-gray-300 hover:!text-blue-400"
                    : "!text-gray-600 hover:!text-blue-600"
                )}
              >
                Tìm bác sĩ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className={cls(
                isDark ? "text-blue-400" : "text-blue-600",
                "!font-bold"
              )}
            >
              {doctor.title} {doctor.fullName}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={[32, 32]}>
          {/* LEFT */}
          <Col xs={24} lg={16}>
            {/* Profile */}
            <Card className={cls("mb-6 border shadow-sm", sectionBg)}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <Avatar
                    size={120}
                    src={doctor.avatarUrl || undefined}
                    style={{
                      backgroundImage: !doctor.avatarUrl
                        ? "linear-gradient(135deg, #1890ff, #096dd9)"
                        : undefined,
                      color: "#fff",
                      fontSize: 48,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "4px solid rgba(255,255,255,0.85)",
                      boxShadow: "0 8px 25px rgba(24,144,255,.25)",
                    }}
                  >
                    {!doctor.avatarUrl &&
                      doctor.fullName?.charAt(0).toUpperCase()}
                  </Avatar>
                </div>

                <div className="flex-1">
                  <Title level={2} className={cls("!mb-3", textStrong)}>
                    {doctor.title} {doctor.fullName}
                  </Title>

                  <div className="space-y-2 mb-4">
                    <div className={cls("flex items-center gap-2", textMuted)}>
                      <UserOutlined />
                      <span>
                        Hơn {doctor.experienceYears} năm kinh nghiệm khám các
                        vấn đề sức khỏe
                      </span>
                    </div>
                    <div className={cls("flex items-center gap-2", textMuted)}>
                      <EnvironmentOutlined />
                      <span>Từng công tác tại {doctor.clinic.clinicName}</span>
                    </div>
                    <div className={cls("flex items-center gap-2", textMuted)}>
                      <EnvironmentOutlined />
                      <span>
                        Từng tu nghiệp tại nước ngoài: Singapore, Hoa Kì
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={cls("flex items-center gap-2", textMuted)}>
                      <EnvironmentOutlined />
                      <span>{doctor.clinic.city}</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<ShareAltOutlined />}
                      className={cls(chipBlue)}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(window.location.href)
                          .then(() =>
                            message.success("Đã copy đường dẫn vào clipboard!")
                          )
                          .catch(() =>
                            message.error("Không thể copy đường dẫn")
                          )
                      }
                    >
                      Chia sẻ
                    </Button>
                    <Button
                      type="primary"
                      icon={<MessageOutlined />}
                      className={cls(chipBlue)}
                      onClick={() =>
                        navigate("/message", { state: { doctorId } })
                      }
                    >
                      Tin nhắn
                    </Button>
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      className={cls(chipBlue)}
                      onClick={() =>
                        navigate(
                          `/booking-options/doctor/${doctor.id}/appointment`
                        )
                      }
                    >
                      Đặt lịch
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Services */}
            <Card className={cls("border shadow-sm", sectionBg)}>
              <Title level={3} className={cls("!mb-4", textStrong)}>
                {doctor.title} {doctor.fullName}
              </Title>

              <div className="space-y-2 mb-6">
                <div className={cls("flex items-center gap-2", textMuted)}>
                  <UserOutlined />
                  <span>
                    Hơn {doctor.experienceYears} năm kinh nghiệm khám các vấn đề
                    sức khỏe
                  </span>
                </div>
                <div className={cls("flex items-center gap-2", textMuted)}>
                  <EnvironmentOutlined />
                  <span>Từng công tác tại {doctor.clinic.clinicName}</span>
                </div>
                <div className={cls("flex items-center gap-2", textMuted)}>
                  <EnvironmentOutlined />
                  <span>Bác sĩ nhận khám mọi độ tuổi</span>
                </div>
              </div>

              <Title level={4} className={cls("!mb-3", textStrong)}>
                Khám và điều trị
              </Title>

              <div className={cls("space-y-3", textMuted)}>
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

            {/* Ratings */}
            <Card className={cls("border shadow-sm mt-6", sectionBg)}>
              <Title level={4} className={cls("!mb-3", textStrong)}>
                Đánh giá của bệnh nhân
              </Title>

              <div className="flex items-center gap-2 mb-3">
                <Rate
                  disabled
                  allowHalf
                  value={toHalf(Number(ratingStats?.avgScore || 0))}
                  character={<StarFilled />}
                />
                <Text className={cls("font-medium", textStrong)}>
                  {ratingStats?.avgScore}
                </Text>
                <Text className={cls(textMuted)}>
                  ({ratingStats?.totalReviews} đánh giá)
                </Text>
              </div>

              {rating?.length === 0 ? (
                <Empty
                  description={
                    <span className={cls(isDark ? "!text-white" : "")}>
                      Chưa có đánh giá
                    </span>
                  }
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
                              : item.isAnonymous
                              ? "A"
                              : item.userId
                              ? item.userId.charAt(0).toUpperCase()
                              : "U"}
                          </Avatar>
                        }
                        title={
                          <div className="flex items-center justify-between">
                            <span className={cls("font-medium", textStrong)}>
                              {item.userProfile?.full_name
                                ? item.userProfile.full_name
                                : item.isAnonymous
                                ? "Ẩn danh"
                                : "Người dùng #" +
                                  (item.userId?.slice(0, 5) ?? "—")}
                            </span>
                            <span className={cls("text-xs", textMuted)}>
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        }
                        description={
                          <div>
                            <Rate
                              disabled
                              allowHalf
                              value={toHalf(Number(ratingStats?.avgScore || 0))}
                              character={<StarFilled />}
                              className="!text-[15px]"
                            />
                            {item.content && (
                              <div
                                className={cls("mt-1 !text-[16px]", textMuted)}
                              >
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

          {/* RIGHT */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              <Card className={cls("border shadow-sm", sectionBg)}>
                <Title level={4} className={cls("!mb-3", textStrong)}>
                  ĐỊA CHỈ KHÁM
                </Title>
                <div className="space-y-3">
                  <div
                    className={cls(
                      "font-medium",
                      isDark ? "text-blue-400" : "text-blue-600"
                    )}
                  >
                    {doctor.clinic.clinicName}
                  </div>
                  <div className={cls(textMuted)}>
                    {doctor.clinic.street}, {doctor.clinic.district},{" "}
                    {doctor.clinic.city}
                  </div>
                </div>
              </Card>

              <Card className={cls("border shadow-sm", sectionBg)}>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Text className={cls(textMuted)}>GIÁ KHÁM:</Text>
                      <Text
                        className={cls(
                          "font-semibold text-lg",
                          isDark ? "text-blue-400" : "text-blue-600"
                        )}
                      >
                        {formatCurrency(Number(doctor.bookingFee))}
                      </Text>
                    </div>
                    <Button
                      type="link"
                      className={cls(
                        "!p-0 !h-auto",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )}
                    >
                      Xem chi tiết
                    </Button>
                  </div>

                  <Divider className="!my-2" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Text className={cls(textMuted)}>
                        LOẠI BẢO HIỂM ÁP DỤNG.
                      </Text>
                    </div>
                    <Button
                      type="link"
                      className={cls(
                        "!p-0 !h-auto",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className={cls("border shadow-sm", sectionBg)}>
                <div className="flex items-center gap-2 mb-2">
                  <Rate
                    disabled
                    allowHalf
                    value={Number(ratingStats?.avgScore || 0)}
                    character={<StarFilled />}
                  />
                  <Text className={cls("font-medium", textStrong)}>
                    {ratingStats?.avgScore ?? "0.0"}
                  </Text>
                  <Text className={cls(textMuted)}>
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
