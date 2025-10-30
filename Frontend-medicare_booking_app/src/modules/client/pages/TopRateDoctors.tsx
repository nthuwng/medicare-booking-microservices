// src/modules/doctor/pages/TopRateDoctors.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Grid,
  List,
  Rate,
  Row,
  Skeleton,
  Space,
  Typography,
  Alert,
  Pagination,
} from "antd";
import {
  BankOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { getTopRateDoctorsAPI } from "../services/client.api";
import type { ITopRateDoctors } from "@/types/rating";
import type { IDoctorProfile } from "@/types/user";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TopRateDoctors = () => {
  const screens = useBreakpoint();
  const [data, setData] = useState<ITopRateDoctors[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 3,
    pages: 0,
    total: 0,
  });

  const cols = useMemo(() => {
    // responsive: xl=3 cột, lg=2, md=2, sm=1
    if (screens.xl) return 3;
    if (screens.lg) return 2;
    if (screens.md) return 2;
    return 1;
  }, [screens]);

  const fetchData = async () => {
    try {
      setErr(null);
      setLoading(true);
      const res = await getTopRateDoctorsAPI(meta.current, meta.pageSize);
      setData(res.data?.result || []);
      if (res?.data?.meta) {
        setMeta({
          current: res.data.meta.current,
          pageSize: res.data.meta.pageSize,
          pages: res.data.meta.pages,
          total: res.data.meta.total,
        });
      }
    } catch (e: any) {
      setErr(e?.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [meta.current, meta.pageSize]);

  const renderTitleTag = (title: IDoctorProfile["title"]) => {
    switch (title) {
      case "BS":
        return <Text>Bác sĩ</Text>;
      case "ThS":
        return <Text>Thạc sĩ</Text>;
      case "TS":
        return <Text>Tiến sĩ</Text>;
      case "PGS":
        return <Text>Phó Giáo sư</Text>;
      case "GS":
        return <Text>Giáo sư</Text>;
      default:
        return <Text>{title}</Text>;
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "56px 16px 24px",
      }}
    >
      <Card
        title={
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ marginBottom: 0 }}>
              Danh sách bác sĩ nổi bật
            </Title>
            <Text type="secondary">
              Dựa trên điểm trung bình và tổng số lượt đánh giá
            </Text>
          </Space>
        }
        bordered
      >
        {err && (
          <Alert
            type="error"
            message="Lỗi tải dữ liệu"
            description={err}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
          {(!data || data.length === 0) && !loading ? (
            <Empty
              description="Chưa có dữ liệu bác sĩ nổi bật"
              style={{ padding: "24px 0" }}
            />
          ) : (
            <>
              <List
                grid={{ gutter: 16, column: cols }}
                dataSource={data || []}
                renderItem={(item: ITopRateDoctors) => {
                  const profile = item.doctorProfile;
                  const avg = Number.parseFloat(item.avgScore || "0") || 0;
                  return (
                    <List.Item key={item.doctorId} style={{ height: "100%" }}>
                      <Card
                        hoverable
                        bodyStyle={{
                          padding: 16,
                          display: "flex",
                          flexDirection: "column",
                          minHeight: 250,
                          height: "100%",
                        }}
                        style={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Content info, flex-1 để đầy phía trên */}
                        <div style={{ flex: 1, display: "flex" }}>
                          {/* Avatar bên trái */}
                          <div
                            style={{
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "flex-start",
                              marginRight: 12,
                            }}
                          >
                            <Avatar
                              shape="square"
                              size={90}
                              src={profile?.avatarUrl}
                              alt={profile?.fullName}
                            >
                              {profile?.fullName?.charAt(0)}
                            </Avatar>
                          </div>
                          {/* Main info bên phải */}
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Text
                              strong
                              style={{ fontSize: 18, color: "#1677ff" }}
                            >
                              {profile?.fullName || "Bác sĩ"}
                            </Text>
                            <div style={{ margin: "8px 0 4px 0" }}>
                              <Rate
                                disabled
                                allowHalf
                                value={avg}
                                style={{ fontSize: 18 }}
                              />
                              <Text strong className="!ml-3">
                                {(avg || 0).toFixed(1)} trên 5
                              </Text>
                            </div>
                            <div
                              style={{
                                color: "rgba(0,0,0,0.7)",
                                marginBottom: 2,
                              }}
                            >
                              <ReadOutlined />
                              <Text className="!ml-2">
                                {renderTitleTag(profile?.title)}
                              </Text>
                            </div>
                            <div
                              style={{
                                color: "rgba(0,0,0,0.7)",
                                marginBottom: 2,
                              }}
                            >
                              <MedicineBoxOutlined />
                              <Text className="!ml-2">
                                {profile?.specialty?.specialtyName ||
                                  "Chuyên khoa"}
                              </Text>
                            </div>
                            <div style={{ color: "rgba(0,0,0,0.7)" }}>
                              <BankOutlined />
                              <Text className="!ml-2">
                                {profile?.clinic?.clinicName || "Phòng khám"}
                              </Text>
                            </div>
                          </div>
                        </div>
                        {/* Nút phải nằm ngoài .flex-1, marginTop:auto luôn bám đáy */}
                        <div
                          style={{ marginTop: "auto", display: "flex", gap: 8 , marginLeft: "auto"}}
                        >
                          <Button
                            type="primary"
                            onClick={() => navigate(`/booking-options/doctor/${item.doctorId}/appointment`)}
                          >
                            Đăng ký khám
                          </Button>
                          <Button onClick={() => navigate(`/booking-options/doctor/${item.doctorId}`)}>
                            Xem chi tiết
                          </Button>
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                <Pagination
                  current={meta.current}
                  pageSize={meta.pageSize}
                  total={meta.total}
                  showSizeChanger
                  onChange={(p, ps) => {
                    setMeta({ ...meta, current: p, pageSize: ps });
                  }}
                  pageSizeOptions={[3, 5, 10, 20, 50, 100]}
                />
              </div>
            </>
          )}
        </Skeleton>
      </Card>
    </div>
  );
};

export default TopRateDoctors;
