import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Button, Typography, Spin, Empty, Tag } from "antd";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { useCurrentApp } from "@/components/contexts/app.context";
import {
  getAllClinics,
  getAllTimeSlots,
  getScheduleByDoctorId,
} from "../../services/doctor.api";
import type { ISchedule, ITimeSlotDetail } from "@/types/schedule";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import DoctorScheduleCreate from "./DoctorSchedule.create";
import type { IClinic } from "@/types";

dayjs.extend(utc);

const { Title, Text } = Typography;

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentApp();

  const [openModalCreate, setOpenModalCreate] = useState(false);

  const [timeSlots, setTimeSlots] = useState<ITimeSlotDetail[]>([]);
  const [clinics, setClinics] = useState<IClinic[]>([]);

  const fetchDoctorSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getScheduleByDoctorId(user?.id as string);
      setSchedules(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchAllTimeSlots = useCallback(async () => {
    const res = await getAllTimeSlots();
    setTimeSlots(res?.data || []);
  }, []);

  const fetchAllClinics = useCallback(async () => {
    const res = await getAllClinics();
    setClinics(res?.data?.result || []);
  }, []);

  useEffect(() => {
    if (user?.id) fetchDoctorSchedule();
    if (user?.id) fetchAllTimeSlots();
    if (user?.id) fetchAllClinics();
  }, [user?.id, fetchDoctorSchedule, fetchAllTimeSlots, fetchAllClinics]);

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

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <Title level={3} className="!mb-0">
            Lịch làm việc của tôi
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenModalCreate(true)}
          >
            Tạo lịch
          </Button>
        </div>

        {sortedSchedules.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center rounded-xl">
            <Empty description="Chưa có lịch làm việc" />
            <Button type="primary" className="mt-4" icon={<PlusOutlined />}>
              Tạo lịch đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedSchedules.map((schedule) => (
              <Card
                key={schedule.id}
                className="shadow-lg border-0 rounded-xl"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue-600" />
                      <span className="text-base font-semibold">
                        Ngày {dayjs.utc(schedule.date).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    <Tag color={schedule.isAvailable ? "green" : "red"}>
                      {schedule.isAvailable ? "Đang mở" : "Đã đóng"}
                    </Tag>
                  </div>
                }
              >
                {schedule.timeSlots.length === 0 ? (
                  <Empty description="Không có khung giờ" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {schedule.timeSlots.map((slot) => {
                      const start = dayjs
                        .utc(slot.timeSlot.startTime)
                        .format("HH:mm");
                      const end = dayjs
                        .utc(slot.timeSlot.endTime)
                        .format("HH:mm");
                      const isFull = slot.currentBooking >= slot.maxBooking;
                      return (
                        <Col
                          xs={24}
                          sm={12}
                          md={8}
                          lg={6}
                          key={`${schedule.id}-${slot.timeSlotId}`}
                        >
                          <Card
                            className="border rounded-lg"
                            bodyStyle={{ padding: 16 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Text strong>
                                {start} - {end}
                              </Text>
                              <Tag color={isFull ? "red" : "green"}>
                                {isFull ? "Đầy" : "Còn chỗ"}
                              </Tag>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>
                                Đã đặt: {slot.currentBooking}/{slot.maxBooking}
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
        clinics={clinics}
      />
    </>
  );
};

export default DoctorSchedule;
