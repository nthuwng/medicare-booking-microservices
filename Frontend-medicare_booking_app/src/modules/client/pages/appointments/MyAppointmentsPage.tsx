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
  Skeleton,
  ConfigProvider,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { IAppointment } from "@/types";
import { getMyAppointmentsAPI } from "@/modules/client/services/client.api";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EvaluateRating from "@/modules/client/components/Rating/EvaluateRating";
import { useCurrentApp } from "@/components/contexts/app.context";

dayjs.extend(utc);
dayjs.extend(timezone);

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [ratingDoctor, setRatingDoctor] = useState<string>("");

  const navigate = useNavigate();
  const { user, theme } = useCurrentApp();
  const isDark = theme === "dark";

  // helpers class
  const cls = (...x: string[]) => x.filter(Boolean).join(" ");
  const pageBg = isDark ? "bg-[#111A2B]" : "bg-white";
  const textStrong = isDark ? "text-gray-100" : "text-slate-900";
  const textMuted = isDark ? "text-gray-400" : "text-slate-600";
  const cardSkin = isDark
    ? "!bg-[#0f1b2d] !border-[#1f2a3a] !text-gray-100"
    : "!bg-white !border-slate-200 !text-slate-900";
  const chipPaid = isDark ? "green" : "green";
  const chipUnpaid = isDark ? "orange" : "orange";

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
        // API của bạn trả về data là mảng -> fallback an toàn
        const list = Array.isArray(res?.data)
          ? (res.data as IAppointment[])
          : [];
        setAppointments(list);
      } catch {
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
    <div className={cls("max-w7xl mx-auto", pageBg)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className={cls("text-2xl font-semibold", textStrong)}>
            Lịch khám đã đặt
          </h1>
          <p className={cls(textMuted)}>Xem và quản lý các lịch hẹn của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <ConfigProvider
            theme={{
              components: {
                Segmented: {
                  // bo tròn & kích thước
                  borderRadius: 10,
                  controlHeight: 36,

                  // màu chung
                  itemColor: isDark ? "white" : "#334155", // chữ thường
                  itemHoverBg: isDark ? "white" : "#f1f5f9", // hover item
                  trackBg: isDark ? "#0f1b2d" : "#E8E8E8", // nền thanh

                  // trạng thái được chọn
                  itemSelectedBg: isDark ? "white" : "white", // nền item chọn
                  itemSelectedColor: "black", // chữ item chọn
                },
              },
            }}
          >
            <Segmented
              size="middle"
              options={[
                { label: "Sắp tới", value: "upcoming" },
                { label: "Đã qua", value: "past" },
                { label: "Tất cả", value: "all" },
              ]}
              value={filter}
              onChange={(v) => setFilter(v as any)}
              className={[
                "!rounded-lg",
                isDark ? "!border !border-[#1f2a3a]" : "",
              ].join(" ")}
            />
          </ConfigProvider>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className={cls("shadow-sm", cardSkin)}>
              <Skeleton active avatar paragraph={{ rows: 4 }} />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-95 flex justify-center items-center py-1">
          <Empty
            description={
              <span
                className={
                  isDark
                    ? "!text-gray-300 !text-[14px] font-semibold"
                    : " !text-[14px] font-semibold"
                }
              >
                Không có lịch hẹn
              </span>
            }
            className={isDark ? "!text-white" : ""}
            imageStyle={{ filter: isDark ? "brightness(0.9)" : undefined }}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const status = getStatusTag(a.status);
            const isConfirmed = (a.status || "").toLowerCase() === "confirmed";
            const feeText =
              a?.totalFee && !Number.isNaN(Number(a.totalFee))
                ? new Intl.NumberFormat("vi-VN").format(Number(a.totalFee)) +
                  " VNĐ"
                : "—";

            return (
              <Card key={a.id} className={cls("shadow-sm border", cardSkin)}>
                <Flex justify="space-between" align="center" className="mb-3">
                  <Tag color={status.color} className="!text-sm">
                    {status.label}
                  </Tag>
                  <div className={cls("text-sm", textMuted)}>
                    Mã lịch hẹn:{" "}
                    <span className={textStrong}>{a.id.slice(0, 8)}</span>
                  </div>
                </Flex>

                <Flex gap={16} align="center" className="mb-3">
                  <Badge
                    dot={a.status?.toUpperCase() === "CONFIRMED"}
                    offset={[0, 36]}
                  >
                    <Avatar
                      size={104}
                      src={a.doctor?.avatarUrl || undefined}
                      style={{
                        backgroundImage: !a.doctor?.avatarUrl
                          ? "linear-gradient(135deg, #1890ff, #096dd9)"
                          : undefined,
                        color: "#fff",
                        fontSize: "42px",
                        fontWeight: 600,
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

                  <div className="flex-1 min-w-0">
                    <div
                      className={cls(
                        "font-medium text-base truncate",
                        textStrong
                      )}
                    >
                      {a.doctor?.fullName ?? "Bác sĩ"}
                    </div>
                    <div className={cls("text-sm truncate", textMuted)}>
                      {a.doctor?.title}
                    </div>
                  </div>
                </Flex>

                <div className={cls("space-y-2 text-sm", textStrong)}>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className={textMuted} />
                    <span>
                      {dayjs(a.appointmentDateTime).format("DD/MM/YYYY")}
                    </span>
                    <ClockCircleOutlined className={cls("ml-3", textMuted)} />
                    <span>
                      {dayjs.utc(a.appointmentDateTime).format("HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdcardOutlined className={textMuted} />
                    <span>{a.patient?.patientName || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className={textMuted} />
                    <span>{a.patient?.patientPhone || "—"}</span>
                  </div>
                </div>

                <Flex justify="space-between" align="center" className="mt-4">
                  <div className={cls("text-sm", textMuted)}>
                    <div className="!text-[16px]">
                      Phí khám:{" "}
                      <span className={cls("font-semibold", textStrong)}>
                        {feeText}
                      </span>
                    </div>
                    <div className="!mt-1">
                      <Tag
                        color={
                          a.paymentStatus === "Paid" ? chipPaid : chipUnpaid
                        }
                        className="!text-sm"
                      >
                        {a.paymentStatus === "Paid"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Tag>
                    </div>
                  </div>

                  <div className="ml-auto grid grid-cols-2 gap-2">
                    <Button
                      onClick={() =>
                        navigate("/message", {
                          state: { doctorId: a.doctorId },
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600 !w-full"
                    >
                      Nhắn tin
                    </Button>

                    <Tooltip
                      title={
                        isConfirmed
                          ? undefined
                          : "Chỉ có thể đánh giá khi lịch hẹn đã được xác nhận"
                      }
                    >
                      <Button
                        className="!w-full"
                        disabled={!isConfirmed}
                        onClick={() => {
                          setRatingModalOpen(true);
                          setRatingDoctor(a.doctorId);
                        }}
                      >
                        Đánh giá bác sĩ
                      </Button>
                    </Tooltip>

                    <Button
                      type="primary"
                      className="!w-full !bg-orange-500 hover:!bg-orange-600"
                      onClick={() => navigate(`/appointment-detail/${a.id}`)}
                    >
                      Xem chi tiết lịch hẹn
                    </Button>

                    <Button
                      type="primary"
                      className="!w-full"
                      onClick={() =>
                        navigate(`/booking-options/doctor/${a.doctorId}`)
                      }
                    >
                      Xem chi tiết bác sĩ
                    </Button>
                  </div>
                </Flex>
              </Card>
            );
          })}
        </div>
      )}

      <EvaluateRating
        ratingModalOpen={ratingModalOpen}
        setRatingModalOpen={setRatingModalOpen}
        userId={user?.id || ""}
        doctorId={ratingDoctor || ""}
      />
    </div>
  );
};

export default MyAppointmentsPage;
