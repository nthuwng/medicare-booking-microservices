import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Typography,
  Tag,
  Flex,
  Button,
  Skeleton,
  Empty,
  Avatar,
  message,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { IAppointmentFullDetail } from "@/types/appointment";
import { getMyAppointmentByIdAPI } from "@/modules/client/services/client.api";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [appointment, setAppointment] = useState<IAppointmentFullDetail | null>(
    null
  );

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getMyAppointmentByIdAPI(id);
        setAppointment(res.data ?? null);
      } catch (err) {
        message.error("Không thể tải chi tiết lịch hẹn");
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const statusTag = useMemo(() => {
    const s = (appointment?.status || "").toLowerCase();
    switch (s) {
      case "confirmed":
        return <Tag color="green">Đã xác nhận</Tag>;
      case "pending":
        return <Tag color="gold">Chờ xác nhận</Tag>;
      case "cancelled":
      case "canceled":
        return <Tag color="red">Đã hủy</Tag>;
      case "completed":
        return <Tag color="blue">Hoàn tất</Tag>;
      default:
        return <Tag>Trạng thái</Tag>;
    }
  }, [appointment?.status]);

  const apptTimeVN = appointment
    ? dayjs.utc(appointment.appointmentDateTime).tz("Asia/Ho_Chi_Minh")
    : null;

  const startTimeVN = appointment?.schedule?.timeSlots?.[0]?.timeSlot?.startTime
    ? dayjs
        .utc(appointment.schedule.timeSlots[0].timeSlot.startTime)
        .format("HH:mm")
    : "";

  const endTimeVN = appointment?.schedule?.timeSlots?.[0]?.timeSlot?.endTime
    ? dayjs
        .utc(appointment.schedule.timeSlots[0].timeSlot.endTime)
        .format("HH:mm")
    : "";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton active />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <Empty description="Không tìm thấy lịch hẹn" />
      </div>
    );
  }

  const getTitleTag = (title: string) => {
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-5">
        <Card className="shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                size={72}
                src={appointment.doctor?.avatarUrl || undefined}
                icon={<UserOutlined />}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Title level={4} style={{ margin: 0 }}>
                    {appointment.doctor?.fullName}
                  </Title>
                  {statusTag}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1 flex-wrap">
                  <span>{getTitleTag(appointment.doctor?.title)}</span>
                  <span>•</span>
                  <Tag className="!bg-violet-500 !text-white">
                    {appointment.doctor?.specialty?.specialtyName}
                  </Tag>
                  <span>•</span>
                  <Tag color="blue-inverse">
                    {appointment.doctor?.clinic?.clinicName}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-gray-500 text-xs">Mã lịch hẹn</div>
              <div className="flex items-center justify-end gap-2">
                <Text code>{appointment.id.slice(0, 8)}</Text>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => navigator.clipboard.writeText(appointment.id)}
                />
              </div>
              <div className="mt-2 text-sm text-blue-600">
                {apptTimeVN?.format("DD/MM/YYYY")}, {startTimeVN} - {endTimeVN}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-16">
          <Card title="Thông tin thời gian">
            <Flex gap={12} align="center" className="mb-2">
              <CalendarOutlined className="text-gray-500" />
              <Text>
                {apptTimeVN?.format("DD/MM/YYYY")} •{" "}
                {apptTimeVN?.format("dddd")}
              </Text>
            </Flex>
            <Flex gap={12} align="center">
              <ClockCircleOutlined className="text-gray-500" />
              <Text>
                {startTimeVN} - {endTimeVN}
              </Text>
            </Flex>
          </Card>

          <Card title="Thông tin bệnh nhân">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Họ tên">
                {appointment.patient?.patientName}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                <Flex gap={8} align="center">
                  <PhoneOutlined />
                  {appointment.patient?.patientPhone}
                </Flex>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Flex gap={8} align="center">
                  <MailOutlined />
                  {appointment.patient?.patientEmail || "—"}
                </Flex>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {appointment.patient?.patientGender === "Male" ? "Nam" : "Nữ"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {dayjs(appointment.patient?.patientDateOfBirth).format(
                  "DD/MM/YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {appointment.patient?.patientAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do khám">
                {appointment.patient?.reason || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        <div className="space-y-16">
          <Card title="Thông tin bác sĩ">
            <Flex gap={16} align="center" className="mb-3">
              <Avatar
                size={64}
                src={appointment.doctor?.avatarUrl}
                icon={<UserOutlined />}
              />
              <div>
                <div className="font-medium text-base">
                  {appointment.doctor?.fullName}
                </div>
                <Text type="secondary">
                  {getTitleTag(appointment.doctor?.title)}
                </Text>
              </div>
            </Flex>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Điện thoại">
                {appointment.doctor?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên khoa">
                {appointment.doctor.specialty.specialtyName}
              </Descriptions.Item>
              <Descriptions.Item label="Cơ sở">
                {appointment.doctor.clinic.clinicName}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ cơ sở">
                {[
                  appointment.doctor.clinic.street,
                  appointment.doctor.clinic.district,
                  appointment.doctor.clinic.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card>
            <Flex justify="space-between" align="center">
              <Text type="secondary">Phí khám</Text>
              <Text strong>
                {new Intl.NumberFormat("vi-VN").format(
                  parseInt(appointment.totalFee)
                ) + " VNĐ"}
              </Text>
            </Flex>
            <Flex justify="space-between" align="center" className="mt-2">
              <Text type="secondary">Thanh toán</Text>
              <Tag
                color={
                  appointment.paymentStatus === "Paid" ? "green" : "orange"
                }
              >
                {appointment.paymentStatus === "Paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </Tag>
            </Flex>
          </Card>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
