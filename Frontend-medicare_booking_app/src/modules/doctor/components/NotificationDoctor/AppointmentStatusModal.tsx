import type { INotificationDataAdmin } from "@/types";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Card, Col, Modal, Row, Typography } from "antd";
import dayjs from "dayjs";
import { updateAppointmentStatus } from "../../services/doctor.api";

interface IProps {
  openModalAppointmentStatus: boolean;
  setOpenModalAppointmentStatus: (open: boolean) => void;
  dataNotificationAppointmentStatus: INotificationDataAdmin | null;
}

const { Text } = Typography;

const AppointmentStatusModal = (props: IProps) => {
  const {
    openModalAppointmentStatus,
    setOpenModalAppointmentStatus,
    dataNotificationAppointmentStatus,
  } = props;

  console.log(
    "dataNotificationAppointmentStatus @@@",
    dataNotificationAppointmentStatus
  );

  const patientName = (dataNotificationAppointmentStatus as any)?.data?.data
    ?.patientName;
  const patientPhone = (dataNotificationAppointmentStatus as any)?.data?.data
    ?.patientPhone;

  const appointmentDateTime = (dataNotificationAppointmentStatus as any)?.data
    ?.data?.appointmentDateTime;
  const appointmentDateTimeVN = appointmentDateTime
    ? dayjs
        .utc(appointmentDateTime)
        .tz("Asia/Ho_Chi_Minh")
        .format("DD/MM/YYYY HH:mm")
    : "";
  const reason = (dataNotificationAppointmentStatus as any)?.data?.data?.reason;
  const totalFee = (dataNotificationAppointmentStatus as any)?.data?.data
    ?.totalFee;

  const appointmentId = (dataNotificationAppointmentStatus as any)?.data?.data
    ?.appointmentId;

  const handleApprove = async () => {
    try {
       await updateAppointmentStatus(appointmentId, "Confirmed");
    } catch (error) {
      console.log("error @@@", error);
    }
    setOpenModalAppointmentStatus(false);

    window.dispatchEvent(new CustomEvent("doctor:appointment-refresh"));
  };

  return (
    <>
      <Modal
        title="Xác nhận lịch hẹn"
        open={openModalAppointmentStatus}
        onCancel={() => setOpenModalAppointmentStatus(false)}
        footer={null}
        width={600}
      >
        <Card title="Thông tin bệnh nhân">
          <Row gutter={[16, 8]}>
            <Col xs={24} md={24}>
              <Text strong style={{ fontSize: "16px" }}>
                Họ tên:{" "}
              </Text>
              <Text style={{ fontSize: "16px" }}>{patientName}</Text>
            </Col>
            <Col xs={24} md={24}>
              <Text strong style={{ fontSize: "16px" }}>
                Số điện thoại:{" "}
              </Text>
              <Text style={{ fontSize: "16px" }}>{patientPhone}</Text>
            </Col>
            <Col xs={24} md={24}>
              <Text strong style={{ fontSize: "16px" }}>
                Ngày giờ hẹn:{" "}
              </Text>
              <Text style={{ fontSize: "16px" }}>{appointmentDateTimeVN}</Text>
            </Col>
            <Col xs={24} md={24}>
              <Text strong style={{ fontSize: "16px" }}>
                Lý do:{" "}
              </Text>
              <Text style={{ fontSize: "16px" }}>{reason}</Text>
            </Col>
            <Col xs={24} md={24}>
              <Text strong style={{ fontSize: "16px" }}>
                Tổng tiền:{" "}
              </Text>
              <Text style={{ fontSize: "16px" }}>
                {new Intl.NumberFormat("vi-VN").format(parseInt(totalFee))}
              </Text>
              <Text style={{ marginLeft: "4px", fontSize: "16px" }}>VNĐ</Text>
            </Col>
          </Row>
        </Card>
        <div className="flex justify-between gap-4 border-gray-200 mt-5">
          <Button
            type="default"
            size="large"
            onClick={() => {
              setOpenModalAppointmentStatus(false);
            }}
            className="flex-1 h-12 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            Đóng
          </Button>
          <Button
            type="default"
            danger
            size="large"
            icon={<CloseOutlined />}
            onClick={() => {}}
            className="flex-1 h-12 rounded-lg border border-red-500 bg-white text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            Từ chối
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckOutlined />}
            onClick={handleApprove}
            className="flex-1 h-12 rounded-lg bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            Phê duyệt
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AppointmentStatusModal;
