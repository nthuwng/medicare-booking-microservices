import { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Button,
  Avatar,
  Descriptions,
  Space,
  Spin,
  Card,
  Tag,
  Empty,
  App,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { approveDoctor, getDoctorInfo } from "../../services/admin.api";
import { FaTransgender } from "react-icons/fa6";
import type { IDoctorProfile, INotificationDataAdmin } from "@/types";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface IProps {
  openModalNotification: boolean;
  setOpenModalNotification: (v: boolean) => void;
  dataNotificationModal: INotificationDataAdmin | null;
  setDataNotificationModal: (v: INotificationDataAdmin | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const NotificationModal = (props: IProps) => {
  const {
    openModalNotification,
    setOpenModalNotification,
    dataNotificationModal,
    setDataNotificationModal,
    loading,
    setLoading,
  } = props;

  const [dataDoctorNotification, setDataDoctorNotification] =
    useState<IDoctorProfile | null>(null);

  const { notification } = App.useApp();

  const handleApprove = async () => {
    try {
      const response = await approveDoctor(
        dataNotificationModal?.data.data.doctorId || ""
      );

      if (response.success === true) {
        notification.success({
          message: "Bác sĩ đã được phê duyệt thành công",
          placement: "top",
          duration: 3,
          style: {
            fontSize: "16px",
          },
        });
        setOpenModalNotification(false);
        setDataNotificationModal(null);
      } else {
        notification.error({
          message: "Phê duyệt bác sĩ thất bại",
        });
      }
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  useEffect(() => {
    const handleGetDoctorInfo = async () => {
      try {
        const response = await getDoctorInfo(
          dataNotificationModal?.data.data.doctorId || ""
        );

        if (response?.data) {
          setDataDoctorNotification(response?.data);
        }
      } catch (error) {
        console.error("Error getting doctor info:", error);
      }
    };

    if (dataNotificationModal) {
      setLoading(true);
      handleGetDoctorInfo();

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [dataNotificationModal]);

  const renderTitleTag = (title: IDoctorProfile["title"]) => {
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
    <>
      <Modal
        loading={loading}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
              <ExclamationCircleOutlined className="text-white text-xl" />
            </div>
            <div>
              <Title level={4} className="m-0 text-blue-500">
                Chi tiết đăng ký bác sĩ
              </Title>
              <Text type="secondary" className="text-xs">
                Xem xét và phê duyệt thông tin
              </Text>
            </div>
          </div>
        }
        open={openModalNotification}
        onCancel={() => {
          setOpenModalNotification(false);
          setDataNotificationModal(null);
        }}
        footer={null}
        width={650}
        centered
        destroyOnClose
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "16px",
            marginBottom: "0",
          },
        }}
      >
        {dataDoctorNotification ? (
          <Spin spinning={loading}>
            <div className="py-5">
              {/* Doctor Profile Card */}
              <Card
                className="mb-6 border border-blue-100 rounded-xl bg-blue-50 shadow-lg"
                styles={{
                  body: { padding: "24px" },
                }}
              >
                <div className="flex items-start gap-5">
                  <Avatar
                    size={80}
                    src={dataDoctorNotification.avatarUrl}
                    icon={<UserOutlined />}
                    className="bg-blue-500 border-4 border-blue-100 shadow-lg"
                    style={{
                      background: dataDoctorNotification.avatarUrl
                        ? undefined
                        : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Title level={3} className="m-0 text-gray-800">
                        {dataDoctorNotification.fullName}
                      </Title>
                      <Tag color="processing" className="text-xs px-2 py-1">
                        {dataDoctorNotification.approvalStatus === "Pending"
                          ? "Chờ phê duyệt"
                          : dataDoctorNotification.approvalStatus === "Approved"
                          ? "Đã phê duyệt"
                          : "Từ chối"}
                      </Tag>
                    </div>

                    <Space
                      direction="vertical"
                      size="middle"
                      className="w-full"
                    >
                      <div className="flex items-center gap-2">
                        <FaTransgender size={16} className="text-gray-500" />
                        <Text strong className="text-gray-700">
                          Giới tính:
                        </Text>
                        {dataDoctorNotification.gender === "Male" ? (
                          <Tag color="blue" className="text-xs">
                            Nam
                          </Tag>
                        ) : dataDoctorNotification.gender === "Female" ? (
                          <Tag color="pink" className="text-xs">
                            Nữ
                          </Tag>
                        ) : (
                          <Tag className="text-xs">Khác</Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneOutlined className="text-green-500 text-base" />
                        <Text strong className="text-sm text-gray-700">
                          {dataDoctorNotification.phone}
                        </Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <MailOutlined className="text-blue-500 text-base" />
                        <Text strong className="text-sm text-gray-700">
                          {dataDoctorNotification.userInfo.email}
                        </Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarOutlined className="text-purple-500 text-base" />
                        <Text type="secondary" className="text-sm">
                          Đăng ký:{" "}
                          {dayjs(dataDoctorNotification.createdAt).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </div>
              </Card>

              {/* Detailed Information */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <IdcardOutlined className="text-blue-500" />
                    <span className="text-base font-semibold text-gray-800">
                      Thông tin chi tiết
                    </span>
                  </div>
                }
                className="mb-6 border border-gray-200 rounded-lg"
                styles={{
                  header: {
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: "#fafafa",
                  },
                }}
              >
                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{
                    fontWeight: 600,
                    color: "#595959",
                    width: "140px",
                  }}
                  contentStyle={{ color: "#262626" }}
                >
                  <Descriptions.Item label="Chức vụ">
                    {renderTitleTag(dataDoctorNotification.title)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kinh nghiệm">
                    {dataDoctorNotification.experienceYears}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chuyên khoa">
                    {dataDoctorNotification.specialty.specialtyName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phòng khám">
                    {dataDoctorNotification.clinic.clinicName}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Action Buttons */}
              {dataDoctorNotification.approvalStatus === "Pending" ? (
                <div className="flex justify-between gap-4 border-gray-200 mt-5">
                  <Button
                    type="default"
                    size="large"
                    onClick={() => {
                      setOpenModalNotification(false);
                      setDataNotificationModal(null);
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
              ) : (
                <div className="flex justify-center py-5">
                  <Text className="text-green-600 font-medium">
                    Bác sĩ đã được phê duyệt
                  </Text>
                </div>
              )}
            </div>
          </Spin>
        ) : (
          <div>
            <Empty description="Không có thông báo để hiển thị." />
          </div>
        )}
      </Modal>
    </>
  );
};

export default NotificationModal;
