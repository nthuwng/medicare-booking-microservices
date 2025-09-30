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
  Select,
  Space,
  message,
  Steps,
  Breadcrumb,
  Spin,
  Result,
  App,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import DoctorInfoCard from "../../components/appointment/DoctorInfoCard";
import PatientInfoForm from "../../components/appointment/PatientInfoForm";
import BookerInfoForm from "../../components/appointment/BookerInfoForm";
import ConfirmCard from "../../components/appointment/ConfirmCard";

const { Title, Text, Paragraph } = Typography;

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
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const { message, notification } = App.useApp();

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
    fetchDoctorDetail();
  }, [doctorId, form]);

  const handleFormSubmit = (values: BookingFormData) => {
    // Lưu form data vào state với appointmentDate
    setFormData({
      ...values,
      appointmentDate: currentSelectedDate,
    });
    // Chuyển sang step xác nhận
    setCurrentStep(1);
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      // Sử dụng saved form data thay vì getFieldsValue
      const values = formData;

      if (!values) {
        message.error("Dữ liệu form bị mất, vui lòng thử lại!");
        setCurrentStep(0);
        setSubmitting(false);
        return;
      }

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

      // Call API to create booking
      const response = await createBooking(bookingData);

      if (response.data) {
        message.success("Đặt lịch thành công!");

        // Chuyển đến trang chọn phương thức thanh toán
        navigate("/payment-selection", {
          state: {
            appointmentData: response.data,
          },
        });
      } else {
        notification.error({
          message: "Có lỗi xảy ra khi đặt lịch!",
          description: response.message,
        });
      }
    } catch (error: any) {
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
    setSelectedTimeSlotId(null);
    setCurrentSelectedDate(selectedDateValue);

    form.setFieldsValue({
      timeSlotId: undefined,
      appointmentDate: selectedDateValue,
    });

    if (selectedDateValue && doctor) {
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
          <Col xs={24} lg={8}>
            {/* Left Column - Doctor Info */}
            <DoctorInfoCard doctor={doctor} />
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
                  onFinish={handleFormSubmit}
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

                  {/* Booker Information Section */}
                  <BookerInfoForm
                    bookingFor={bookingFor}
                    setBookingFor={setBookingFor}
                  />

                  {/* Patient Information Section */}
                  <PatientInfoForm bookingFor={bookingFor} />

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
                  <ConfirmCard
                    formData={formData as BookingFormData}
                    availableTimeSlots={availableTimeSlots as TimeSlot[]}
                  />

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
                          handleConfirmBooking();
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
