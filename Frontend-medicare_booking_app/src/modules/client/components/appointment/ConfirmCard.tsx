import { Card, Typography, Row, Col } from "antd";

const { Text } = Typography;

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

interface IProps {
  formData: BookingFormData;
  availableTimeSlots: TimeSlot[];
}

const ConfirmCard = (props: IProps) => {
  const { formData, availableTimeSlots } = props;

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
  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        {(() => {
          const currentFormData = formData;
          return (
            <div>
              {/* Thông tin người đặt lịch (nếu đặt cho người thân) */}
              {currentFormData?.bookingFor === "other" && (
                <Card
                  title="👤 Thông tin người đặt lịch"
                  style={{ marginBottom: "16px" }}
                  size="small"
                >
                  <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                      <Text strong>Họ tên: </Text>
                      <Text>{formData?.bookerName}</Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>Mối quan hệ: </Text>
                      <Text>
                        {
                          relationships.find(
                            (rel) =>
                              rel.value === formData?.relationshipToPatient
                          )?.label
                        }
                      </Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>Số điện thoại: </Text>
                      <Text>{formData?.bookerPhone}</Text>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>Email: </Text>
                      <Text>{formData?.bookerEmail}</Text>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Thông tin bệnh nhân */}
              <Card
                title={
                  formData?.bookingFor === "self"
                    ? "👤 Thông tin của bạn"
                    : "🏥 Thông tin bệnh nhân"
                }
                size="small"
              >
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Text strong>Họ tên: </Text>
                    <Text>{formData?.patientName}</Text>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Giới tính: </Text>
                    <Text>{formData?.gender === "male" ? "Nam" : "Nữ"}</Text>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Số điện thoại: </Text>
                    <Text>{formData?.phone}</Text>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Email: </Text>
                    <Text>{formData?.email}</Text>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Năm sinh: </Text>
                    <Text>{formData?.dateOfBirth}</Text>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Địa chỉ: </Text>
                    <Text>
                      {formData?.address},{" "}
                      {
                        districts.find((d) => d.value === formData?.district)
                          ?.label
                      }
                      ,{" "}
                      {
                        provinces.find((p) => p.value === formData?.province)
                          ?.label
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
                      {formData?.appointmentDate}
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
                        const selectedSlot = availableTimeSlots.find(
                          (slot) => slot.id === formData?.timeSlotId
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
                  {formData?.reason && (
                    <Col span={24}>
                      <Text strong>Lý do khám: </Text>
                      <Text>{formData?.reason}</Text>
                    </Col>
                  )}
                </Row>
              </Card>
            </div>
          );
        })()}
      </div>
    </>
  );
};

export default ConfirmCard;
