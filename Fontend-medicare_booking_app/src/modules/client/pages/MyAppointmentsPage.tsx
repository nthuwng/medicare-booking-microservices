import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Segmented,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { IAppointment } from "@/types";
import { getMyAppointmentsAPI } from "@/modules/client/services/client.api";
import { FaPhoneAlt } from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const filtered = useMemo(() => {
    if (filter === "all") return appointments;
    const now = dayjs();
    return appointments.filter((a) => {
      const time = dayjs.utc(a.appointmentDateTime);
      return filter === "upcoming" ? time.isAfter(now) : time.isBefore(now);
    });
  }, [appointments, filter]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await getMyAppointmentsAPI();
        const backend = res.data as unknown as IBackendRes<IAppointment[]>;
        const list = Array.isArray(backend) ? backend : [];
        setAppointments(list);
      } catch (error) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getStatusTag = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "pending":
        return { color: "gold", label: "Chờ xác nhận" };
      case "confirmed":
        return { color: "green", label: "Đã xác nhận" };
      case "cancelled":
      case "canceled":
        return { color: "red", label: "Đã hủy" };
      case "completed":
        return { color: "blue", label: "Hoàn tất" };
      default:
        return { color: "default", label: status || "Trạng thái" };
    }
  };

  return (
    <div className=" max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Lịch khám đã đặt</h1>
          <p className="text-gray-500">Xem và quản lý các lịch hẹn của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            size="middle"
            options={[
              { label: "Sắp tới", value: "upcoming" },
              { label: "Đã qua", value: "past" },
              { label: "Tất cả", value: "all" },
            ]}
            value={filter}
            onChange={(v) => setFilter(v as any)}
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="h-95 flex justify-center items-center py-16">
          <Empty description={loading ? "Đang tải..." : "Không có lịch hẹn"} />
        </div>
      ) : (
        <div className=" grid md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const status = getStatusTag(a.status);
            return (
              <Card key={a.id} className="shadow-sm">
                <Flex justify="space-between" align="center" className="mb-3">
                  <Tag color={status.color}>{status.label}</Tag>
                  <div className="text-gray-400 text-sm">
                    Mã lịch hẹn: {a.id.slice(0, 8)}
                  </div>
                </Flex>

                <Flex gap={16} align="center" className="mb-3">
                  <Badge dot={a.status === "CONFIRMED"} offset={[0, 36]}>
                    <Avatar
                      size={104}
                      src={a.doctor?.avatarUrl || undefined}
                      style={{
                        backgroundImage: !a.doctor?.avatarUrl
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
                      {!a.doctor?.avatarUrl &&
                        a.doctor?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-base">
                      {a.doctor?.fullName ?? "Bác sĩ"}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {a.doctor?.title}
                    </div>
                  </div>
                </Flex>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-500" />
                    <span>
                      {dayjs(a.appointmentDateTime).format("DD/MM/YYYY")}
                    </span>
                    <ClockCircleOutlined className="text-gray-500 ml-3" />
                    <span>
                      {dayjs.utc(a.appointmentDateTime).format("HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdcardOutlined className="text-gray-500" />
                    <span>{a.patient?.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-500" />
                    <span>{a.patient?.patientPhone}</span>
                  </div>
                </div>

                <Flex justify="space-between" align="center" className="mt-4">
                  <div className="text-gray-500 text-sm">
                    Phí khám:{" "}
                    <span className="text-gray-800 font-medium">
                      {new Intl.NumberFormat("vi-VN").format(
                        parseInt(a.totalFee)
                      ) + " VNĐ"}
                    </span>
                  </div>
                  <div>
                    <Button
                      onClick={() => navigate(`/message/${a.doctorId}`)}
                      className="!mr-2 bg-blue-600 hover:bg-blue-700 border-blue-600"
                    >
                      Nhắn tin
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => navigate(`/appointment-detail/${a.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Flex>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
