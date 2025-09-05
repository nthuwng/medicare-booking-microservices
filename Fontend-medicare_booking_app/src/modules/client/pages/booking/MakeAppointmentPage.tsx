import type { IDoctorProfile } from "@/types";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDoctorDetailBookingById,
  createBooking,
} from "../../services/client.api";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  Radio,
  Avatar,
  Space,
  Tag,
  Divider,
  message,
  Steps,
  Breadcrumb,
  Spin,
  Result,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  RightOutlined,
  StarFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type TimeSlot = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  scheduleId: string;
};

type BookingFormData = {
  patientName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  province: string;
  district: string;
  address: string;
  reason: string;
  bookingFor: string;
  appointmentDate: string;
  timeSlotId: number;
  // Thông tin người đặt lịch (khi đặt cho người thân)
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
  relationshipToPatient?: string;
};

const MakeAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [doctor, setDoctor] = useState<IDoctorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [bookingFor, setBookingFor] = useState<string>("self");
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [currentSelectedDate, setCurrentSelectedDate] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null
  );

  const fetchDoctorDetail = async () => {
    if (!doctorId) return;

    setLoading(true);
    try {
      const response = await getDoctorDetailBookingById(doctorId);

      if (response.data) {
        setDoctor(response.data);
        const dates = response.data.scheduleByDoctorId.map(
          (item: any) => item.date
        );
        setSelectedDate(dates);

        // Tự động load khung giờ cho ngày đầu tiên
        if (dates.length > 0) {
          const firstDate = dates[0];
          setCurrentSelectedDate(firstDate);

          const selectedSchedule = response.data.scheduleByDoctorId.find(
            (schedule: any) => schedule.date === firstDate
          );

          if (selectedSchedule) {
            const timeSlots = selectedSchedule.timeSlots.map(
              (timeSlot: any) => ({
                id: timeSlot.timeSlotId,
                startTime: timeSlot.timeSlot.startTime,
                endTime: timeSlot.timeSlot.endTime,
                status: timeSlot.status,
                scheduleId: selectedSchedule.id,
              })
            );
            setAvailableTimeSlots(timeSlots);

            // Set form value cho ngày đầu tiên
            form.setFieldsValue({
              appointmentDate: firstDate,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching doctor detail:", error);
      message.error("Không thể tải thông tin bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log("availableTimeSlots =>>>>>>>>>>", availableTimeSlots);
    fetchDoctorDetail();
  }, [doctorId, form]);

  const provinces = [
    { label: "Hà Nội", value: "hanoi" },
    { label: "Hồ Chí Minh", value: "hcm" },
    { label: "Đà Nẵng", value: "danang" },
    { label: "Hải Phòng", value: "haiphong" },
    { label: "Cần Thơ", value: "cantho" },
  ];

  const districts = [
    { label: "Ba Đình", value: "ba-dinh" },
    { label: "Hoàn Kiếm", value: "hoan-kiem" },
    { label: "Đống Đa", value: "dong-da" },
    { label: "Cầu Giấy", value: "cau-giay" },
    { label: "Thanh Xuân", value: "thanh-xuan" },
  ];

  const relationships = [
    { label: "Con", value: "child" },
    { label: "Cha/Mẹ", value: "parent" },
    { label: "Anh/Chị/Em", value: "sibling" },
    { label: "Vợ/Chồng", value: "spouse" },
    { label: "Ông/Bà", value: "grandparent" },
    { label: "Cháu", value: "grandchild" },
    { label: "Khác", value: "other" },
  ];

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => time.substring(0, 5); // Remove seconds
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const onFinish = async (values: BookingFormData) => {
    setSubmitting(true);
    try {
      // Find the selected schedule
      const selectedTimeSlot = availableTimeSlots.find(
        (slot) => slot.id === values.timeSlotId
      );

      if (!selectedTimeSlot) {
        message.error("Vui lòng chọn khung giờ khám!");
        setSubmitting(false);
        return;
      }

      // Prepare data for API
      const bookingData = {
        scheduleId: selectedTimeSlot.scheduleId,
        timeSlotId: values.timeSlotId,
        reason: values.reason || "",
        patientName: values.patientName,
        patientPhone: values.phone,
        patientEmail: values.email,
        patientGender: values.gender === "male" ? "Male" : "Female",
        patientDateOfBirth: values.dateOfBirth,
        patientCity: values.province,
        patientDistrict: values.district,
        patientAddress: values.address,
        // Thông tin người đặt lịch (nếu đặt cho người thân)
        ...(bookingFor === "other" && {
          bookerName: values.bookerName,
          bookerPhone: values.bookerPhone,
          bookerEmail: values.bookerEmail,
        }),
      };

      console.log("Booking data:", bookingData);

      // Call API to create booking
      const response = await createBooking(bookingData);

      if (response.data) {
        message.success("Đặt lịch thành công!");
        setCurrentStep(2);
      } else {
        message.error("Có lỗi xảy ra khi đặt lịch!");
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch!";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Thông tin cá nhân",
      description: "Nhập thông tin bệnh nhân",
    },
    {
      title: "Xác nhận",
      description: "Kiểm tra và xác nhận",
    },
    {
      title: "Hoàn thành",
      description: "Đặt lịch thành công",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <Result
        status="404"
        title="Không tìm thấy bác sĩ"
        subTitle="Thông tin bác sĩ không tồn tại hoặc đã bị xóa."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  const handleDateSelect = (selectedDateValue: string) => {
    // Clear selected time slot when date changes
    setSelectedTimeSlotId(null);
    // Update current selected date
    setCurrentSelectedDate(selectedDateValue);

    form.setFieldsValue({
      timeSlotId: undefined,
      appointmentDate: selectedDateValue,
    });

    if (selectedDateValue && doctor) {
      // Tìm schedule tương ứng với ngày được chọn
      const selectedSchedule = doctor.scheduleByDoctorId.find(
        (schedule: any) => schedule.date === selectedDateValue
      );

      if (selectedSchedule) {
        // Cập nhật time slots cho ngày được chọn
        const timeSlots = selectedSchedule.timeSlots.map((timeSlot: any) => ({
          id: timeSlot.timeSlotId,
          startTime: timeSlot.timeSlot.startTime,
          endTime: timeSlot.timeSlot.endTime,
          status: timeSlot.status,
          scheduleId: selectedSchedule.id,
        }));
        console.log("timeSlots test =>>>>>>>>>>", timeSlots);
        setAvailableTimeSlots(timeSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumb */}
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
              Đặt lịch khám
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <Row gutter={[24, 24]}>
          {/* Left Column - Doctor Info */}
          <Col xs={24} lg={8}>
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
                    <StarFilled
                      style={{ color: "#faad14", marginRight: "4px" }}
                    />
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
                        Number(doctor.consultationFee) +
                        Number(doctor.bookingFee)
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
          </Col>

          {/* Right Column - Booking Form */}
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: "12px",
                border: "1px solid #e8f4f8",
              }}
              bodyStyle={{ padding: "32px" }}
            >
              {/* Steps */}
              <Steps
                current={currentStep}
                style={{ marginBottom: "32px" }}
                items={steps}
              />

              {currentStep === 0 && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  requiredMark={false}
                >
                  {/* Hidden field for timeSlotId validation */}
                  <Form.Item
                    name="timeSlotId"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn khung giờ khám!",
                      },
                    ]}
                    style={{ display: "none" }}
                  >
                    <input type="hidden" />
                  </Form.Item>
                  <div>
                    <Title
                      level={4}
                      style={{ marginBottom: "24px", color: "#1890ff" }}
                    >
                      📅 Thông tin đặt lịch
                    </Title>

                    {/* Date Selection Card */}
                    <Card
                      className="mb-6"
                      style={{
                        borderRadius: "16px",
                        border: "2px solid #e6f7ff",
                        backgroundColor: "#fafcff",
                        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)",
                      }}
                      bodyStyle={{ padding: "24px" }}
                    >
                      <div style={{ marginBottom: "20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <CalendarOutlined
                            style={{
                              fontSize: "20px",
                              color: "#1890ff",
                              marginRight: "8px",
                            }}
                          />
                          <Title
                            level={5}
                            style={{ margin: 0, color: "#1890ff" }}
                          >
                            Chọn ngày khám
                          </Title>
                        </div>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          Vui lòng chọn ngày bạn muốn đặt lịch khám bệnh
                        </Text>
                      </div>

                      <Select
                        value={currentSelectedDate || undefined}
                        onChange={handleDateSelect}
                        className="w-full"
                        size="large"
                        placeholder="-- Chọn ngày khám --"
                        style={{
                          borderRadius: "12px",
                        }}
                        options={[...selectedDate].map((date) => ({
                          value: date,
                          label: (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "4px 0",
                              }}
                            >
                              <CalendarOutlined
                                style={{ marginRight: "8px", color: "#1890ff" }}
                              />
                              <span style={{ fontWeight: "500" }}>{date}</span>
                            </div>
                          ),
                        }))}
                      />
                    </Card>

                    {/* Time Slots Card */}
                    <Card
                      style={{
                        borderRadius: "16px",
                        border: "2px solid #f0f9ff",
                        backgroundColor: "#fafcff",
                        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.08)",
                      }}
                      bodyStyle={{ padding: "24px" }}
                    >
                      <div style={{ marginBottom: "20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <ClockCircleOutlined
                            style={{
                              fontSize: "20px",
                              color: "#52c41a",
                              marginRight: "8px",
                            }}
                          />
                          <Title
                            level={5}
                            style={{ margin: 0, color: "#52c41a" }}
                          >
                            Khung giờ khám
                          </Title>
                        </div>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {availableTimeSlots.length > 0
                            ? `Có ${availableTimeSlots.length} khung giờ khả dụng`
                            : "Vui lòng chọn ngày để xem khung giờ khả dụng"}
                        </Text>
                      </div>

                      {availableTimeSlots.length > 0 ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "12px",
                          }}
                        >
                          {availableTimeSlots.map((slot) => {
                            const isSelected = selectedTimeSlotId === slot.id;
                            return (
                              <Button
                                key={slot.id}
                                size="large"
                                type={isSelected ? "primary" : "default"}
                                style={{
                                  height: "60px",
                                  borderRadius: "12px",
                                  border: isSelected
                                    ? "2px solid #1890ff"
                                    : "2px solid #d9f7be",
                                  backgroundColor: isSelected
                                    ? "#1890ff"
                                    : "#f6ffed",
                                  color: isSelected ? "#ffffff" : "#52c41a",
                                  fontWeight: "600",
                                  fontSize: "15px",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.3s ease",
                                  cursor: "pointer",
                                  boxShadow: isSelected
                                    ? "0 6px 16px rgba(24, 144, 255, 0.3)"
                                    : "none",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor =
                                      "#52c41a";
                                    e.currentTarget.style.backgroundColor =
                                      "#e6f7ff";
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 6px 16px rgba(82, 196, 26, 0.2)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.borderColor =
                                      "#d9f7be";
                                    e.currentTarget.style.backgroundColor =
                                      "#f6ffed";
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                  }
                                }}
                                onClick={() => {
                                  setSelectedTimeSlotId(slot.id);
                                  form.setFieldsValue({
                                    timeSlotId: slot.id,
                                  });
                                }}
                              >
                                <ClockCircleOutlined
                                  style={{
                                    fontSize: "16px",
                                    marginBottom: "4px",
                                    color: isSelected ? "#ffffff" : "#52c41a",
                                  }}
                                />
                                <span>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            backgroundColor: "#fafafa",
                            borderRadius: "12px",
                            border: "2px dashed #d9d9d9",
                          }}
                        >
                          <ClockCircleOutlined
                            style={{
                              fontSize: "48px",
                              color: "#bfbfbf",
                              marginBottom: "16px",
                            }}
                          />
                          <div>
                            <Text
                              strong
                              style={{ color: "#8c8c8c", fontSize: "16px" }}
                            >
                              Chưa có khung giờ khả dụng
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                              Vui lòng chọn ngày khác hoặc liên hệ trực tiếp với
                              phòng khám
                            </Text>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Booking For Section */}
                  <Card
                    style={{
                      borderRadius: "16px",
                      border: "2px solid #fff2e8",
                      backgroundColor: "#fffbf5",
                      boxShadow: "0 4px 12px rgba(250, 140, 22, 0.1)",
                      marginBottom: "24px",
                    }}
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <UserOutlined
                          style={{
                            fontSize: "20px",
                            color: "#fa8c16",
                            marginRight: "8px",
                          }}
                        />
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#fa8c16" }}
                        >
                          Đặt lịch cho ai?
                        </Title>
                      </div>
                      <Text type="secondary" style={{ fontSize: "14px" }}>
                        Chọn bạn đang đặt lịch cho ai
                      </Text>
                    </div>

                    <Form.Item
                      name="bookingFor"
                      initialValue="self"
                      rules={[{ required: true }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Radio.Group
                        onChange={(e) => setBookingFor(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Radio
                            value="self"
                            style={{
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #d9d9d9",
                              backgroundColor: "#ffffff",
                              fontWeight: "500",
                            }}
                          >
                            👤 Đặt cho mình
                          </Radio>
                          <Radio
                            value="other"
                            style={{
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #d9d9d9",
                              backgroundColor: "#ffffff",
                              fontWeight: "500",
                            }}
                          >
                            👨‍👩‍👧‍👦 Đặt cho người thân
                          </Radio>
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  </Card>

                  {/* Thông tin người đặt lịch - chỉ hiển thị khi đặt cho người thân */}
                  {bookingFor === "other" && (
                    <div
                      style={{
                        backgroundColor: "#f0f9ff",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid #bae6fd",
                        marginBottom: "24px",
                      }}
                    >
                      <Title
                        level={5}
                        style={{ color: "#0369a1", marginBottom: "16px" }}
                      >
                        👤 Thông tin người đặt lịch
                      </Title>

                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text strong>Họ tên người đặt</Text>}
                            name="bookerName"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên người đặt!",
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Nhập họ tên của bạn"
                              prefix={
                                <UserOutlined style={{ color: "#bfbfbf" }} />
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <Text strong>Mối quan hệ với bệnh nhân</Text>
                            }
                            name="relationshipToPatient"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn mối quan hệ!",
                              },
                            ]}
                          >
                            <Select size="large" placeholder="Chọn mối quan hệ">
                              {relationships.map((rel) => (
                                <Option key={rel.value} value={rel.value}>
                                  {rel.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text strong>Số điện thoại người đặt</Text>}
                            name="bookerPhone"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập số điện thoại!",
                              },
                              {
                                pattern: /^[0-9]{10,11}$/,
                                message: "Số điện thoại không hợp lệ!",
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Nhập số điện thoại của bạn"
                              prefix={
                                <PhoneOutlined style={{ color: "#bfbfbf" }} />
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<Text strong>Email người đặt</Text>}
                            name="bookerEmail"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập email!",
                              },
                              { type: "email", message: "Email không hợp lệ!" },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Nhập email của bạn"
                              prefix={
                                <MailOutlined style={{ color: "#bfbfbf" }} />
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Patient Information Section */}
                  <Card
                    style={{
                      borderRadius: "16px",
                      border: "2px solid #e6f7ff",
                      backgroundColor: "#fafcff",
                      boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)",
                      marginBottom: "24px",
                    }}
                    bodyStyle={{ padding: "24px" }}
                  >
                    <div style={{ marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        {bookingFor === "self" ? (
                          <UserOutlined
                            style={{
                              fontSize: "20px",
                              color: "#1890ff",
                              marginRight: "8px",
                            }}
                          />
                        ) : (
                          <UserOutlined
                            style={{
                              fontSize: "20px",
                              color: "#1890ff",
                              marginRight: "8px",
                            }}
                          />
                        )}
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#1890ff" }}
                        >
                          {bookingFor === "self"
                            ? "Thông tin của bạn"
                            : "Thông tin bệnh nhân"}
                        </Title>
                      </div>
                      <Text type="secondary" style={{ fontSize: "14px" }}>
                        Vui lòng nhập đầy đủ thông tin để chúng tôi có thể liên
                        hệ và xác nhận lịch khám
                      </Text>
                    </div>

                    <Row gutter={[16, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong>Họ tên bệnh nhân</Text>}
                          name="patientName"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ tên!",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Nhập họ tên bệnh nhân"
                            prefix={
                              <UserOutlined style={{ color: "#bfbfbf" }} />
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong>Giới tính</Text>}
                          name="gender"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn giới tính!",
                            },
                          ]}
                        >
                          <Radio.Group>
                            <Radio value="male">Nam</Radio>
                            <Radio value="female">Nữ</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong>Số điện thoại liên hệ</Text>}
                          name="phone"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại!",
                            },
                            {
                              pattern: /^[0-9]{10,11}$/,
                              message: "Số điện thoại không hợp lệ!",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Nhập số điện thoại"
                            prefix={
                              <PhoneOutlined style={{ color: "#bfbfbf" }} />
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong>Địa chỉ email</Text>}
                          name="email"
                          rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Nhập địa chỉ email"
                            prefix={
                              <MailOutlined style={{ color: "#bfbfbf" }} />
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label={<Text strong>Năm sinh</Text>}
                      name="dateOfBirth"
                      rules={[
                        { required: true, message: "Vui lòng nhập năm sinh!" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Nhập năm sinh (ví dụ: 1990)"
                        prefix={
                          <CalendarOutlined style={{ color: "#bfbfbf" }} />
                        }
                      />
                    </Form.Item>

                    <Row gutter={[16, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong>Tỉnh/Thành phố</Text>}
                          name="province"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn tỉnh/thành!",
                            },
                          ]}
                        >
                          <Select
                            size="large"
                            placeholder="-- Chọn Tỉnh/Thành --"
                          >
                            {provinces.map((province) => (
                              <Option
                                key={province.value}
                                value={province.value}
                              >
                                {province.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<Text strong>Quận/Huyện</Text>}
                          name="district"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn quận/huyện!",
                            },
                          ]}
                        >
                          <Select
                            size="large"
                            placeholder="-- Chọn Quận/Huyện --"
                          >
                            {districts.map((district) => (
                              <Option
                                key={district.value}
                                value={district.value}
                              >
                                {district.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label={<Text strong>Địa chỉ</Text>}
                      name="address"
                      rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ!" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Nhập số nhà, tên đường..."
                        prefix={
                          <EnvironmentOutlined style={{ color: "#bfbfbf" }} />
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label={<Text strong>Lý do khám</Text>}
                      name="reason"
                    >
                      <TextArea
                        rows={4}
                        placeholder="Mô tả triệu chứng, lý do khám bệnh..."
                        maxLength={400}
                        showCount
                      />
                    </Form.Item>
                  </Card>

                  <div style={{ textAlign: "center", marginTop: "32px" }}>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={submitting}
                      style={{
                        width: "200px",
                        height: "48px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "500",
                        background:
                          "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                      }}
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </Form>
              )}

              {currentStep === 1 && (
                <div>
                  <Title
                    level={4}
                    style={{
                      color: "#1890ff",
                      marginBottom: "24px",
                      textAlign: "center",
                    }}
                  >
                    Xác nhận thông tin đặt lịch
                  </Title>

                  {/* Hiển thị thông tin đã nhập */}
                  <div style={{ marginBottom: "32px" }}>
                    {(() => {
                      const formData = form.getFieldsValue();
                      return (
                        <div>
                          {/* Thông tin người đặt lịch (nếu đặt cho người thân) */}
                          {formData.bookingFor === "other" && (
                            <Card
                              title="👤 Thông tin người đặt lịch"
                              style={{ marginBottom: "16px" }}
                              size="small"
                            >
                              <Row gutter={[16, 8]}>
                                <Col xs={24} md={12}>
                                  <Text strong>Họ tên: </Text>
                                  <Text>{formData.bookerName}</Text>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Text strong>Mối quan hệ: </Text>
                                  <Text>
                                    {
                                      relationships.find(
                                        (rel) =>
                                          rel.value ===
                                          formData.relationshipToPatient
                                      )?.label
                                    }
                                  </Text>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Text strong>Số điện thoại: </Text>
                                  <Text>{formData.bookerPhone}</Text>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Text strong>Email: </Text>
                                  <Text>{formData.bookerEmail}</Text>
                                </Col>
                              </Row>
                            </Card>
                          )}

                          {/* Thông tin bệnh nhân */}
                          <Card
                            title={
                              formData.bookingFor === "self"
                                ? "👤 Thông tin của bạn"
                                : "🏥 Thông tin bệnh nhân"
                            }
                            size="small"
                          >
                            <Row gutter={[16, 8]}>
                              <Col xs={24} md={12}>
                                <Text strong>Họ tên: </Text>
                                <Text>{formData.patientName}</Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Giới tính: </Text>
                                <Text>
                                  {formData.gender === "male" ? "Nam" : "Nữ"}
                                </Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Số điện thoại: </Text>
                                <Text>{formData.phone}</Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Email: </Text>
                                <Text>{formData.email}</Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Năm sinh: </Text>
                                <Text>{formData.dateOfBirth}</Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Địa chỉ: </Text>
                                <Text>
                                  {formData.address},{" "}
                                  {
                                    districts.find(
                                      (d) => d.value === formData.district
                                    )?.label
                                  }
                                  ,{" "}
                                  {
                                    provinces.find(
                                      (p) => p.value === formData.province
                                    )?.label
                                  }
                                </Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Ngày khám: </Text>
                                <Text
                                  style={{
                                    color: "#1890ff",
                                    fontWeight: "600",
                                  }}
                                >
                                  {formData.appointmentDate}
                                </Text>
                              </Col>
                              <Col xs={24} md={12}>
                                <Text strong>Giờ khám: </Text>
                                <Text
                                  style={{
                                    color: "#1890ff",
                                    fontWeight: "600",
                                  }}
                                >
                                  {(() => {
                                    const selectedSlot =
                                      availableTimeSlots.find(
                                        (slot) =>
                                          slot.id === formData.timeSlotId
                                      );
                                    return selectedSlot
                                      ? formatTimeSlot(
                                          selectedSlot.startTime,
                                          selectedSlot.endTime
                                        )
                                      : "Chưa chọn";
                                  })()}
                                </Text>
                              </Col>
                              {formData.reason && (
                                <Col span={24}>
                                  <Text strong>Lý do khám: </Text>
                                  <Text>{formData.reason}</Text>
                                </Col>
                              )}
                            </Row>
                          </Card>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <Paragraph
                      style={{ fontSize: "16px", marginBottom: "32px" }}
                    >
                      Vui lòng kiểm tra lại thông tin và xác nhận đặt lịch
                    </Paragraph>
                    <Space size="large">
                      <Button
                        size="large"
                        onClick={() => setCurrentStep(0)}
                        style={{ width: "120px" }}
                      >
                        Quay lại
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        loading={submitting}
                        onClick={() => {
                          const formData = form.getFieldsValue();
                          onFinish(formData);
                        }}
                        style={{
                          width: "180px",
                          height: "40px",
                        }}
                      >
                        Xác nhận đặt lịch
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ textAlign: "center" }}>
                  <CheckCircleOutlined
                    style={{
                      fontSize: "64px",
                      color: "#52c41a",
                      marginBottom: "24px",
                    }}
                  />
                  <Title
                    level={3}
                    style={{ color: "#52c41a", marginBottom: "16px" }}
                  >
                    Đặt lịch thành công!
                  </Title>
                  <Paragraph style={{ fontSize: "16px", marginBottom: "32px" }}>
                    Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác
                    nhận lịch khám.
                    <br />
                    Vui lòng giữ máy và chú ý điện thoại.
                  </Paragraph>
                  <Space size="large">
                    <Button
                      size="large"
                      onClick={() => navigate("/")}
                      style={{ width: "150px" }}
                    >
                      Về trang chủ
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => navigate("/profile/appointments")}
                      style={{ width: "150px" }}
                    >
                      Xem lịch khám
                    </Button>
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MakeAppointmentPage;
