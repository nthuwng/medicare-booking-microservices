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
  Steps,
  Breadcrumb,
  Spin,
  Result,
  App,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";

import DoctorInfoCard from "../../components/appointment/DoctorInfoCard";
import PatientInfoForm from "../../components/appointment/PatientInfoForm";
import BookerInfoForm from "../../components/appointment/BookerInfoForm";
import ConfirmCard from "../../components/appointment/ConfirmCard";

import { useCurrentApp } from "@/components/contexts/app.context";

const { Title, Text } = Typography;
const cls = (...x: (string | false | undefined)[]) =>
  x.filter(Boolean).join(" ");

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
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
  relationshipToPatient?: string;
};

const MakeAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";

  const [doctor, setDoctor] = useState<IDoctorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [bookingFor, setBookingFor] = useState("self");
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [currentSelectedDate, setCurrentSelectedDate] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState<BookingFormData | null>(null);

  const { message, notification } = App.useApp();

  // ✅ Fetch doctor detail
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

        if (dates.length > 0) {
          const firstDate = dates[0];
          setCurrentSelectedDate(firstDate);

          const schedule = response.data.scheduleByDoctorId.find(
            (s: any) => s.date === firstDate
          );

          if (schedule) {
            const slots = schedule.timeSlots.map((t: any) => ({
              id: t.timeSlotId,
              startTime: t.timeSlot.startTime,
              endTime: t.timeSlot.endTime,
              status: t.status,
              scheduleId: schedule.id,
            }));
            setAvailableTimeSlots(slots);
            form.setFieldsValue({ appointmentDate: firstDate });
          }
        }
      }
    } catch (e) {
      message.error("Không thể tải thông tin bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetail();
  }, [doctorId]);

  const pageBg = isDark
    ? "!bg-[#0b1220]"
    : "bg-gradient-to-b from-blue-50 to-white";
  const cardBg = isDark
    ? "!bg-[#0e1625] !border !border-[#1e293b66]"
    : "!bg-white !border";
  const titleTx = isDark ? "!text-slate-100" : "!text-gray-800";

  // ✅ Submit form step 1
  const handleFormSubmit = (values: BookingFormData) => {
    setFormData({
      ...values,
      dateOfBirth: (values as any)?.dateOfBirth?.format
        ? (values as any).dateOfBirth.format("YYYY-MM-DD")
        : values.dateOfBirth,
      appointmentDate: currentSelectedDate,
    });
    setCurrentStep(1);
  };

  const handleConfirmBooking = async () => {
    if (!formData) return;
    setSubmitting(true);

    try {
      const selectedTimeSlot = availableTimeSlots.find(
        (s) => s.id === formData.timeSlotId
      );

      if (!selectedTimeSlot) {
        message.error("Vui lòng chọn khung giờ khám");
        setSubmitting(false);
        return;
      }

      const bookingData = {
        scheduleId: selectedTimeSlot.scheduleId,
        timeSlotId: formData.timeSlotId,
        patientName: formData.patientName,
        patientPhone: formData.phone,
        patientEmail: formData.email,
        patientGender: formData.gender === "male" ? "Male" : "Female",
        patientDateOfBirth: formData.dateOfBirth,
        patientCity: formData.province,
        patientDistrict: formData.district,
        patientAddress: formData.address,
        reason: formData.reason,
        ...(bookingFor === "other" && {
          bookerName: formData.bookerName,
          bookerPhone: formData.bookerPhone,
          bookerEmail: formData.bookerEmail,
        }),
      };

      const response = await createBooking(bookingData);

      if (response.data) {
        message.success("Đặt lịch thành công!");
        navigate("/payment-selection", {
          state: { appointmentData: response.data },
        });
      } else {
        notification.error({
          message: "Lỗi",
          description: response.message,
        });
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ UI When Loading / Not Found
  if (loading)
    return (
      <div
        className={cls("min-h-screen flex items-center justify-center", pageBg)}
      >
        <Spin size="large" />
      </div>
    );

  if (!doctor)
    return (
      <Result
        status="404"
        title="Không tìm thấy bác sĩ"
        subTitle="Thông tin không tồn tại."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        }
      />
    );

  return (
    <div className={cls("min-h-screen", pageBg)}>
      {/* ✅ Style Override for dark mode UI */}
      {isDark && (
        <style>{`
          .ant-steps-item-title,
          .ant-steps-item-description {
            color:#e5e7eb !important;
          }

          .select-dark .ant-select-selector{
      background:#0b1220 !important;
      border-color:#243244 !important;
      color:#e5e7eb !important;
    }
    .select-dark .ant-select-selection-item,
    .select-dark .ant-select-selection-placeholder{
      color:#e5e7eb !important;
      opacity:1 !important;
    }
    .select-dark .ant-select-arrow{
      color:#94a3b8 !important;
    }
    .select-dark.ant-select-open .ant-select-selector{
      background:#0b1220 !important; /* giữ nguyên, không tối thêm */
      box-shadow:0 0 0 2px rgba(59,130,246,.25) !important;
      border-color:#3b82f6 !important;
    }

    /* Dropdown */
    .select-dark-dropdown.ant-select-dropdown{
      background:#0e1625 !important;
      border:1px solid #1e293b66 !important;
      box-shadow:0 12px 28px rgba(0,0,0,.45) !important;
    }
    .select-dark-dropdown .ant-select-item{
      color:#cbd5e1 !important;
      background:transparent !important; /* bỏ nền tối toàn bộ item */
    }
    .select-dark-dropdown .ant-select-item-option-active{
      background:#122033 !important;
    }
    .select-dark-dropdown .ant-select-item-option-selected{
      background:#1b2b44 !important;
      color:#60a5fa !important;
    }
    .select-dark-dropdown .ant-empty-description{
      color:#94a3b8 !important;
    }

       .steps-dark .ant-steps-item-title,
    .steps-dark .ant-steps-item-description {
      color:#e5e7eb !important;
    }
    /* vòng tròn chung */
    .steps-dark .ant-steps-item-icon{
      background:#0b1220 !important;
      border-color:#334155 !important;
    }
    /* số trong vòng tròn */
    .steps-dark .ant-steps-item-icon .ant-steps-icon{
      color:#e5e7eb !important;         /* <- số màu trắng */
      font-weight:600;
    }
    /* trạng thái đang thực hiện (process) */
    .steps-dark .ant-steps-item-process .ant-steps-item-icon{
      background:#1e293b !important;
      border-color:#60a5fa !important;
    }
    .steps-dark .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon{
      color:#ffffff !important;          /* số trắng rõ */
    }
    /* đã hoàn thành (finish) */
    .steps-dark .ant-steps-item-finish .ant-steps-item-icon{
      background:#0b1220 !important;
      border-color:#60a5fa !important;
    }
    .steps-dark .ant-steps-item-finish .ant-steps-item-icon .ant-steps-finish-icon{
      color:#60a5fa !important;          /* màu check */
    }
    /* chưa tới (wait) */
    .steps-dark .ant-steps-item-wait .ant-steps-item-icon{
      background:#0b1220 !important;
      border-color:#334155 !important;
    }
    .steps-dark .ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon{
      color:#cbd5e1 !important;
    }
    /* màu đường nối giữa các step */
    .steps-dark .ant-steps-item-tail::after{
      background-color:#334155 !important;
    }
    .steps-dark .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after{
      background-color:#60a5fa !important;
    }

    .select-dark-dropdown .ant-empty-description{
  color:#e5e7eb !important;   /* trắng */
  opacity:1 !important;
}

/* (tuỳ chọn) nếu build của bạn render thêm lớp bọc */
.select-dark-dropdown .ant-select-item-empty{
  color:#e5e7eb !important;
  opacity:1 !important;
}

/* (tuỳ chọn) làm icon Empty sáng hơn một chút */
.select-dark-dropdown .ant-empty-image svg{
  filter: brightness(1.1) contrast(1.05);
}

        `}</style>
      )}

      {/* ✅ Breadcrumb */}
      <div
        className={cls(
          "border-b",
          isDark ? "bg-[#0e1625] border-[#1e293b66]" : "bg-white"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={
              <RightOutlined
                className={isDark ? "!text-slate-300" : "!text-gray-400"}
              />
            }
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className={cls(isDark ? "!text-slate-300" : "!text-gray-600")}
              >
                Trang chủ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/booking-options")}
                className={cls(isDark ? "!text-slate-300" : "!text-gray-600")}
              >
                Hình thức đặt lịch
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className={cls(
                isDark ? "text-blue-300" : "text-blue-600",
                "font-semibold"
              )}
            >
              Đặt lịch khám
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <DoctorInfoCard doctor={doctor} />
          </Col>

          <Col xs={24} lg={16}>
            <Card
              className={cls("rounded-xl", cardBg)}
              bodyStyle={{ padding: 32 }}
            >
              <Steps
                current={currentStep}
                className={cls(isDark && "steps-dark")}
                style={{ marginBottom: 32 }}
                items={[
                  { title: "Thông tin cá nhân" },
                  { title: "Xác nhận" },
                  { title: "Hoàn thành" },
                ]}
              />

              {/* STEP 1 */}
              {currentStep === 0 && (
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                  {/* Hidden field */}
                  <Form.Item
                    name="timeSlotId"
                    style={{ display: "none" }}
                    rules={[
                      { required: true, message: "Chọn khung giờ khám!" },
                    ]}
                  >
                    <input type="hidden" />
                  </Form.Item>

                  <Title level={4} className={cls(titleTx, "!mb-4")}>
                    📅 Thông tin đặt lịch
                  </Title>

                  {/* DATE PICKER */}
                  <Card
                    className={cls("mb-6 rounded-xl", cardBg)}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="mb-3 flex items-center">
                      <CalendarOutlined className="!text-blue-400 mr-2" />
                      <Text
                        className={cls(
                          isDark ? "!text-blue-300 " : "!text-blue-600",
                          "!font-medium "
                        )}
                      >
                        Chọn ngày khám
                      </Text>
                    </div>

                    <Select
                      size="large"
                      value={currentSelectedDate || undefined}
                      onChange={(v) => setCurrentSelectedDate(v)}
                      className={cls(
                        "w-full rounded-lg",
                        isDark && "select-dark"
                      )}
                      popupClassName={
                        isDark ? "select-dark-dropdown" : undefined
                      }
                      options={selectedDate.map((d) => ({
                        value: d,
                        label: d,
                      }))}
                    />
                  </Card>

                  {/* TIME SLOTS */}
                  <Card
                    className={cls("rounded-xl", cardBg)}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div className="mb-3 flex items-center">
                      <ClockCircleOutlined
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      <Text
                        className={cls(
                          isDark ? "!text-green-300" : "!text-green-600",
                          "!font-medium"
                        )}
                      >
                        Khung giờ khám
                      </Text>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {availableTimeSlots.map((slot) => {
                        const active = selectedTimeSlotId === slot.id;
                        return (
                          <Button
                            key={slot.id}
                            size="large"
                            onClick={() => {
                              setSelectedTimeSlotId(slot.id);
                              form.setFieldsValue({ timeSlotId: slot.id });
                            }}
                            className={cls(
                              "rounded-lg !font-semibold",
                              active
                                ? "!bg-blue-600 !text-white !shadow-lg"
                                : isDark
                                ? "!bg-[#0f1625] !text-green-300 !border-green-700 hover:!bg-[#0d1a2b]"
                                : "!bg-green-50 text-green-700 border-green-200"
                            )}
                          >
                            {slot.startTime} - {slot.endTime}
                          </Button>
                        );
                      })}
                    </div>
                  </Card>

                  <BookerInfoForm
                    bookingFor={bookingFor}
                    setBookingFor={setBookingFor}
                  />
                  <PatientInfoForm bookingFor={bookingFor} />

                  <div className="text-center mt-6">
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      className="rounded-lg w-48 h-12"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </Form>
              )}

              {/* STEP 2 */}
              {currentStep === 1 && (
                <div className="text-center">
                  <Title level={4} className={cls(titleTx, "!mb-6")}>
                    Xác nhận thông tin
                  </Title>

                  <ConfirmCard
                    formData={formData as BookingFormData}
                    availableTimeSlots={availableTimeSlots}
                  />

                  <Space size="large" style={{ marginTop: 24 }}>
                    <Button size="large" onClick={() => setCurrentStep(0)}>
                      Quay lại
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      loading={submitting}
                      onClick={handleConfirmBooking}
                    >
                      Xác nhận đặt lịch
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
