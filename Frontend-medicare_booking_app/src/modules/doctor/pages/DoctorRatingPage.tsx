import { useEffect, useMemo, useState } from "react";
import {
  Card,
  List,
  Avatar,
  Rate,
  Empty,
  message,
  Spin,
  DatePicker,
} from "antd";
import { StarFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useCurrentApp } from "@/components/contexts/app.context";
import {
  fetchRatingByDoctorIdAPI,
  getDoctorProfileByUserId,
} from "../../doctor/services/doctor.api";
import type { IRating } from "@/types/rating";
import type { IDoctorProfile } from "@/types";
import { Typography } from "antd";

const { Text } = Typography;
const DoctorRatingPage = () => {
  const { user } = useCurrentApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [doctor, setDoctor] = useState<IDoctorProfile | null>(null);
  const [ratings, setRatings] = useState<IRating[]>([]);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);

  const doctorId = useMemo(() => doctor?.id ?? "", [doctor]);

  const formatDate = (isoString: string) => {
    const d = dayjs(isoString);
    if (!d.isValid()) return isoString;
    return d.locale("vi").format("DD/MM/YYYY HH:mm");
  };

  const fetchDoctor = async () => {
    if (!user?.id) return;
    const res = await getDoctorProfileByUserId(user.id);
    if (res.data) setDoctor(res.data);
  };

  const fetchRatings = async (dId: string) => {
    const res = await fetchRatingByDoctorIdAPI(dId);
    if (res.data) {
      setRatings(res.data.ratings || []);
    }
  };

  const init = async () => {
    try {
      setLoading(true);
      await fetchDoctor();
    } catch (e) {
      message.error("Không thể tải thông tin bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!doctorId) return;
    fetchRatings(doctorId);
  }, [doctorId]);

  const filteredRatings = useMemo(() => {
    const [start, end] = dateRange;
    if (!start && !end) return ratings;
    return ratings.filter((r) => {
      const d = dayjs(r.createdAt);
      const afterStart = start
        ? d.isAfter(start.startOf("day")) || d.isSame(start.startOf("day"))
        : true;
      const beforeEnd = end
        ? d.isBefore(end.endOf("day")) || d.isSame(end.endOf("day"))
        : true;
      return afterStart && beforeEnd;
    });
  }, [ratings, dateRange]);

  const filteredAvg = useMemo(() => {
    if (filteredRatings.length === 0) return 0;
    const sum = filteredRatings.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / filteredRatings.length) * 10) / 10;
  }, [filteredRatings]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Overall Rating */}
      <Card className="!rounded-4xl !mb-5 !shadow-lg !shadow-zinc-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="!text-[25px] font-semibold text-[#0b2e59]">
              Overall Rating
            </div>
            <div className="!mt-1 !mb-2 flex items-center gap-3">
              <span className="text-3xl font-bold text-[#0b2e59]">
                {filteredAvg.toFixed(1)}
              </span>

              <Rate
                disabled
                allowHalf
                value={Number(filteredAvg || 0)}
                character={<StarFilled />}
              />
            </div>
            <Text className="!text-[14px] text-[#0b2e59]">
              Tổng số đánh giá: {filteredRatings.length}
            </Text>
          </div>
          <DatePicker.RangePicker
            allowClear
            value={dateRange}
            onChange={(v) => setDateRange([v?.[0] || null, v?.[1] || null])}
            format="DD/MM/YYYY"
            className="!rounded-xl"
          />
        </div>
      </Card>

      {/* List Ratings */}
      <Card className="!rounded-xl !shadow-lg !shadow-zinc-300">
        {filteredRatings.length === 0 ? (
          <Empty description="Chưa có đánh giá" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredRatings}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar>
                      {item.userProfile?.full_name
                        ? item.userProfile.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </Avatar>
                  }
                  title={
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {item.userProfile.full_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  }
                  description={
                    <div>
                      <Rate
                        disabled
                        allowHalf
                        value={item.score}
                        character={<StarFilled />}
                        className="!text-[15px]"
                      />
                      {item.content && (
                        <div className="mt-1 text-[14px] text-gray-700">
                          {item.content}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default DoctorRatingPage;
