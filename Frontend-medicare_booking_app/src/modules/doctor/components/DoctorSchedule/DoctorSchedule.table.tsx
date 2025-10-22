import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Spin,
  Empty,
  Tag,
  DatePicker,
  Space,
  Select,
  Form,
  App,
} from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  FilterOutlined,
  ClearOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/contexts/app.context";
import {
  deleteScheduleByScheduleIdAPI,
  getAllTimeSlots,
  getDoctorProfileByUserId,
  getScheduleByDoctorId,
  updateExpiredTimeSlots,
  deleteTimeSlotFromScheduleAPI,
} from "../../services/doctor.api";
import type { ISchedule, ITimeSlotDetail } from "@/types/schedule";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import DoctorScheduleCreate from "./DoctorSchedule.create";
import type { IDoctorProfile } from "@/types";

dayjs.extend(utc);

const { Title, Text } = Typography;

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentApp();

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [timeSlots, setTimeSlots] = useState<ITimeSlotDetail[]>([]);
  const [dataDoctor, setDataDoctor] = useState<IDoctorProfile | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<"all" | "date" | "range">("all");
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [form] = Form.useForm();
  const { message, notification } = App.useApp();

  const fetchDoctorSchedule = useCallback(
    async (filters?: { date?: string; from?: string; to?: string }) => {
      try {
        setLoading(true);
        const res = await getScheduleByDoctorId(user?.id as string, filters);

        setSchedules(res?.data || []);
      } catch (e) {
        console.error(e);
        message.error("Lỗi khi tải lịch làm việc");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const fetchDataDoctor = useCallback(async () => {
    const res = await getDoctorProfileByUserId(user?.id as string);
    if (res?.data) {
      setDataDoctor(res?.data);
    }
  }, [user?.id]);

  const fetchAllTimeSlots = useCallback(async () => {
    const res = await getAllTimeSlots();
    setTimeSlots(res?.data || []);
  }, []);

  // Filter functions
  const handleFilterChange = useCallback(() => {
    let filters: { date?: string; from?: string; to?: string } | undefined;

    if (filterType === "date" && selectedDate) {
      filters = { date: selectedDate.format("YYYY-MM-DD") };
    } else if (filterType === "range" && dateRange[0] && dateRange[1]) {
      filters = {
        from: dateRange[0].format("YYYY-MM-DD"),
        to: dateRange[1].format("YYYY-MM-DD"),
      };
    }

    fetchDoctorSchedule(filters);
  }, [filterType, selectedDate, dateRange, fetchDoctorSchedule]);

  const handleClearFilters = useCallback(() => {
    setFilterType("all");
    setSelectedDate(null);
    setDateRange([null, null]);
    form.resetFields();
    fetchDoctorSchedule();
  }, [form, fetchDoctorSchedule]);

  const handleFilterTypeChange = useCallback(
    (value: "all" | "date" | "range") => {
      setFilterType(value);
      if (value === "all") {
        handleClearFilters();
      }
    },
    [handleClearFilters]
  );

  useEffect(() => {
    const initializeData = async () => {
      if (user?.id) {
        try {
          await updateExpiredTimeSlots();
          console.log("✅ Đã tự động cập nhật time slots hết hạn");
        } catch (error) {
          console.log("⚠️ Lỗi khi tự động cập nhật expired slots:", error);
        }

        fetchDoctorSchedule();
        fetchDataDoctor();
        fetchAllTimeSlots();
      }
    };

    initializeData();
  }, [user?.id, fetchDoctorSchedule, fetchAllTimeSlots, fetchDataDoctor]);

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort(
      (a, b) => dayjs.utc(a.date).valueOf() - dayjs.utc(b.date).valueOf()
    );
  }, [schedules]);

  if (loading) {
    return (
      <div className="h-fullbg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Đang tải lịch làm việc...</div>
        </div>
      </div>
    );
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    const res = await deleteScheduleByScheduleIdAPI(scheduleId);
    if (res?.data) {
      notification.success({
        placement: "top",
        message: "Xóa lịch khám thành công",
      });
      fetchDoctorSchedule();
    } else {
      notification.error({
        placement: "top",
        message: "Xóa lịch khám thất bại",
        description: res.message,
      });
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={3} className="!mb-0">
              Lịch làm việc của tôi
            </Title>
            <Text type="secondary" className="text-sm">
              Tổng cộng: {sortedSchedules.length} lịch
            </Text>
          </div>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ẩn bộ lọc" : "Bộ lọc"}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setOpenModalCreate(true);
                // Đảm bảo dataDoctor được fetch lại khi mở modal
                if (!dataDoctor) {
                  fetchDataDoctor();
                }
              }}
            >
              Tạo lịch
            </Button>
          </Space>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card
            className="mb-4"
            title={
              <div className="flex items-center justify-between">
                <span>Bộ lọc lịch làm việc</span>
                <Tag color="blue" className="ml-2">
                  {sortedSchedules.length} kết quả
                </Tag>
              </div>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Loại bộ lọc">
                    <Select
                      value={filterType}
                      onChange={handleFilterTypeChange}
                      options={[
                        { label: "Tất cả lịch", value: "all" },
                        { label: "Theo ngày cụ thể", value: "date" },
                        { label: "Theo khoảng ngày", value: "range" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                {filterType === "date" && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Chọn ngày">
                      <DatePicker
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                      />
                    </Form.Item>
                  </Col>
                )}

                {filterType === "range" && (
                  <>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Từ ngày">
                        <DatePicker
                          value={dateRange[0]}
                          onChange={(date) =>
                            setDateRange([date, dateRange[1]])
                          }
                          format="DD/MM/YYYY"
                          placeholder="Từ ngày"
                          style={{ width: "100%" }}
                          disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Đến ngày">
                        <DatePicker
                          value={dateRange[1]}
                          onChange={(date) =>
                            setDateRange([dateRange[0], date])
                          }
                          format="DD/MM/YYYY"
                          placeholder="Đến ngày"
                          style={{ width: "100%" }}
                          disabledDate={(current) => {
                            if (!dateRange[0])
                              return (
                                current && current < dayjs().startOf("day")
                              );
                            return (
                              current &&
                              (current < dayjs().startOf("day") ||
                                current < dateRange[0])
                            );
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>

              {/* Hiển thị thông tin filter hiện tại */}
              {filterType !== "all" && (
                <Row className="mb-4">
                  <Col span={24}>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Text strong className="text-blue-600">
                        Bộ lọc hiện tại:{" "}
                      </Text>
                      {filterType === "date" && selectedDate && (
                        <Text>Ngày {selectedDate.format("DD/MM/YYYY")}</Text>
                      )}
                      {filterType === "range" &&
                        dateRange[0] &&
                        dateRange[1] && (
                          <Text>
                            Từ {dateRange[0].format("DD/MM/YYYY")} đến{" "}
                            {dateRange[1].format("DD/MM/YYYY")}
                          </Text>
                        )}
                    </div>
                  </Col>
                </Row>
              )}

              <Row justify="end">
                <Space>
                  <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                    Xóa bộ lọc
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleFilterChange}
                    disabled={
                      (filterType === "date" && !selectedDate) ||
                      (filterType === "range" &&
                        (!dateRange[0] || !dateRange[1]))
                    }
                  >
                    Áp dụng bộ lọc
                  </Button>
                </Space>
              </Row>
            </Form>
          </Card>
        )}

        {sortedSchedules.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center rounded-xl">
            <Empty description="Chưa có lịch làm việc" />
            <Button
              type="primary"
              className="mt-4"
              icon={<PlusOutlined />}
              onClick={() => {
                setOpenModalCreate(true);
                // Đảm bảo dataDoctor được fetch lại khi mở modal
                if (!dataDoctor) {
                  fetchDataDoctor();
                }
              }}
            >
              Tạo lịch đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hiển thị số lượng kết quả */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-600" />
                  <Text strong>Danh sách lịch làm việc</Text>
                </div>
                <Tag color="green" className="text-sm">
                  {sortedSchedules.length} lịch
                </Tag>
              </div>
            </div>
            {sortedSchedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="shadow-lg border-0 rounded-xl !mb-2 !mt-2"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue-600" />
                      <span className="text-base font-semibold">
                        Ngày{" "}
                        {dayjs(schedule.date).isValid()
                          ? dayjs(schedule.date).format("DD/MM/YYYY")
                          : "Invalid Date"}
                      </span>
                      <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          handleDeleteSchedule(schedule.id);
                        }}
                      />
                    </div>
                    <Tag
                      color={
                        schedule.timeSlots.some(
                          (slot) => slot.status === "OPEN"
                        )
                          ? "green"
                          : "default"
                      }
                    >
                      {schedule.timeSlots.some((slot) => slot.status === "OPEN")
                        ? "Còn khung giờ mở"
                        : "Tất cả hết hạn"}
                    </Tag>
                  </div>
                }
              >
                {schedule.timeSlots.length === 0 ? (
                  <Empty description="Không có khung giờ" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {schedule.timeSlots
                      .sort((a, b) => {
                        // Sắp xếp: OPEN lên trên, EXPIRED xuống dưới
                        if (a.status === "OPEN" && b.status === "EXPIRED")
                          return -1;
                        if (a.status === "EXPIRED" && b.status === "OPEN")
                          return 1;
                        // Nếu cùng status, sắp xếp theo thời gian
                        return a.timeSlot.startTime.localeCompare(
                          b.timeSlot.startTime
                        );
                      })
                      .map((slot) => {
                        const start = slot.timeSlot.startTime || "00:00";
                        const end = slot.timeSlot.endTime || "00:00";
                        const isFull = slot.currentBooking >= slot.maxBooking;
                        const isExpired = slot.status === "EXPIRED";

                        // Xác định màu và text cho tag status
                        const getStatusTag = () => {
                          if (isExpired) {
                            return { color: "default", text: "Hết hạn" };
                          }
                          if (isFull) {
                            return { color: "red", text: "Đầy" };
                          }
                          return { color: "green", text: "Còn chỗ" };
                        };

                        const statusTag = getStatusTag();

                        const handleDeleteTimeSlot = async () => {
                          const res = await deleteTimeSlotFromScheduleAPI(
                            schedule.id,
                            slot.timeSlotId
                          );
                          if (res.success === true) {
                            notification.success({
                              placement: "top",
                              message: res.message,
                            });
                            fetchDoctorSchedule();
                          } else {
                            notification.error({
                              placement: "top",
                              message: "Xóa khung giờ thất bại",
                              description: res.message,
                            });
                          }
                        };

                        return (
                          <Col
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            key={`${schedule.id}-${slot.timeSlotId}`}
                          >
                            <Card
                              className={`border rounded-lg ${
                                isExpired ? "opacity-60" : ""
                              }`}
                              bodyStyle={{ padding: 16 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Text
                                  strong
                                  className={isExpired ? "text-gray-400" : ""}
                                >
                                  {start} - {end}
                                </Text>
                                <Tag color={statusTag.color}>
                                  {statusTag.text}
                                </Tag>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>
                                  Đã đặt: {slot.currentBooking}/
                                  {slot.maxBooking}
                                </div>
                                <div className="text-xs mt-1">
                                  Trạng thái:{" "}
                                  {slot.status === "OPEN" ? "Mở" : "Hết hạn"}
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <Button
                                    size="small"
                                    danger
                                    type="primary"
                                    onClick={handleDeleteTimeSlot}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                  </Row>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      <DoctorScheduleCreate
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        timeSlots={timeSlots}
        dataDoctor={dataDoctor}
        setDataDoctor={setDataDoctor}
        onCreated={fetchDoctorSchedule}
      />
    </>
  );
};

export default DoctorSchedule;
