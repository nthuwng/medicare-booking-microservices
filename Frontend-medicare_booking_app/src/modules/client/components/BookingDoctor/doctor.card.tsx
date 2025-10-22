import {
  Card,
  Avatar,
  Rate,
  Button,
  Row,
  Col,
  Typography,
  Tag,
  Badge,
} from "antd";
import {
  StarFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { IDoctorProfile } from "@/types";

const { Title, Text, Paragraph } = Typography;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

type DoctorCardProps = {
  dataDoctors: IDoctorProfile[];
  setDataDoctors: (doctors: IDoctorProfile[]) => void;
  searchText: string;
};

const DoctorCard = (props: DoctorCardProps) => {
  const { dataDoctors } = props;
  const navigate = useNavigate();

  const handleViewDoctorDetail = (doctorId: string) => {
    // Navigate to doctor detail page
    navigate(`/booking-options/doctor/${doctorId}`);
  };

  return (
    <>
      {dataDoctors.length > 0 && (
        <Row gutter={[24, 24]}>
          {dataDoctors.map((doctor) => (
            <Col key={doctor.id} xs={24} sm={24} md={12} lg={12} xl={12}>
              <Card
                className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm h-full"
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0 md:self-start self-center">
                    <Badge dot={true} color="#52c41a" offset={[-5, 5]}>
                      <Avatar
                        size={96}
                        src={doctor.avatarUrl || undefined}
                        style={{
                          backgroundImage: !doctor.avatarUrl
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
                        {!doctor.avatarUrl &&
                          doctor.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex md:flex-row flex-col items-start md:items-center justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <Title
                          level={4}
                          className="!mb-1 !text-gray-800 truncate"
                        >
                          {doctor.fullName}
                        </Title>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Tag
                            color="blue"
                            className="rounded-full whitespace-normal"
                          >
                            {doctor.specialty.specialtyName}
                          </Tag>
                          <Text className="text-gray-500 text-sm">
                            {doctor.experienceYears} năm kinh nghiệm
                          </Text>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="text-right md:self-start self-stretch">
                        <div className="flex items-center gap-1 mb-1 md:justify-end">
                          <Rate
                            disabled
                            defaultValue={4.5}
                            className="text-sm"
                            character={<StarFilled />}
                          />
                          <Text className="text-sm font-medium text-gray-700">
                            4.5
                          </Text>
                        </div>
                        <Text className="text-xs text-gray-500">
                          (127 đánh giá)
                        </Text>
                      </div>
                    </div>

                    {/* Clinic & Location */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <EnvironmentOutlined />
                        <span>{doctor.clinic.clinicName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockCircleOutlined />
                        <span>8 lịch trống</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <Paragraph
                      className="!mb-4 !text-gray-600 !text-sm line-clamp-3 md:line-clamp-2"
                      ellipsis={{ rows: 3 }}
                    >
                      {doctor.bio ||
                        "Bác sĩ chuyên khoa với nhiều năm kinh nghiệm trong lĩnh vực y tế."}
                    </Paragraph>

                    {/* Fees & Action */}
                    <div className="flex md:flex-row flex-col md:items-center items-start justify-between gap-3">
                      <div className="flex items-center gap-6">
                        <div>
                          <Text className="text-xs text-gray-500">
                            Phí khám
                          </Text>
                          <div className="font-semibold text-blue-600">
                            {formatCurrency(Number(doctor.consultationFee))}
                          </div>
                        </div>
                        <div>
                          <Text className="text-xs text-gray-500">
                            Phí đặt lịch
                          </Text>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(Number(doctor.bookingFee))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button
                          size="middle"
                          onClick={() => handleViewDoctorDetail(doctor.id)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full md:w-auto"
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          type="primary"
                          size="middle"
                          onClick={() =>
                            navigate(
                              `/booking-options/doctor/${doctor.id}/appointment`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full md:w-auto"
                          icon={<CalendarOutlined />}
                        >
                          Đặt lịch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default DoctorCard;
