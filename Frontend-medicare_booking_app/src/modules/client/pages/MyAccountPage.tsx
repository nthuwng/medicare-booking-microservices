import { Avatar, Button, Card, Descriptions, Tag, Typography } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useCurrentApp } from "@/components/contexts/app.context";
import { useEffect, useState } from "react";
import ChangePassword from "../components/MyAccount/ChangePassword";
import { getPatientProfileAPI } from "../services/client.api";
import type { IPatientProfile } from "@/types/user";
import UpdateProfile from "../components/MyAccount/UpdateProfile";

const { Title, Text } = Typography;

const MyAccountPage = () => {
  const { user } = useCurrentApp();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [patientProfile, setPatientProfile] = useState<IPatientProfile | null>(
    null
  );

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [dataUpdateProfile, setDataUpdateProfile] =
    useState<IPatientProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      setLoading(true);
      const response = await getPatientProfileAPI(user?.id || "");
      if (response.success === true) {
        setPatientProfile(response.data as IPatientProfile);
        setDataUpdateProfile(response.data as IPatientProfile);
      }
      setLoading(false);
    };
    fetchPatientProfile();
  }, [user?.id]);

  useEffect(() => {
    if (dataUpdateProfile) {
      setPatientProfile({ ...patientProfile, ...dataUpdateProfile });
    }
  }, [dataUpdateProfile]);

  return (
    <>
      <div className="max-w7xl ">
        <Card className="shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                size={104}
                src={patientProfile?.avatar_url || undefined}
                style={{
                  backgroundImage: !patientProfile?.avatar_url
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
                {!patientProfile?.avatar_url &&
                  patientProfile?.full_name?.charAt(0).toUpperCase()}
              </Avatar>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Title level={4} style={{ margin: 0 }}>
                    {patientProfile?.full_name}
                  </Title>
                  <Tag color="blue-inverse">Tài khoản</Tag>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MailOutlined /> {patientProfile?.userInfo?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <PhoneOutlined /> {patientProfile?.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <Button
                type="primary"
                onClick={() => setEditProfileModalOpen(true)}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Thông tin cá nhân">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Họ tên">
                {patientProfile?.full_name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {patientProfile?.gender === "Male"
                  ? "Nam"
                  : patientProfile?.gender === "Female"
                  ? "Nữ"
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {patientProfile?.date_of_birth
                  ? dayjs(patientProfile?.date_of_birth).format("DD/MM/YYYY")
                  : "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Liên hệ">
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Email">
                {patientProfile?.userInfo?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {patientProfile?.phone}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Địa chỉ" className="md:col-span-2">
            <Descriptions column={2} size="middle" bordered>
              <Descriptions.Item label="Đường">
                {patientProfile?.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">
                {patientProfile?.district || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Thành phố">
                {patientProfile?.city || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Bảo mật">
            {user?.authProvider === "GOOGLE" ? (
              <Text type="secondary" className="!text-[16px]">
                Bạn không thể đổi mật khẩu vì tài khoản được đăng nhập bằng
                Google.
              </Text>
            ) : (
              <>
                <Text type="secondary" className="!text-[16px]">
                  Bạn có thể đổi mật khẩu để bảo vệ tài khoản tốt hơn.
                </Text>
                <div className="mt-2">
                  <Button
                    type="primary"
                    onClick={() => setPasswordModalOpen(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
      <ChangePassword
        passwordModalOpen={passwordModalOpen}
        setPasswordModalOpen={setPasswordModalOpen}
      />
      <UpdateProfile
        loading={loading}
        setLoading={setLoading}
        editProfileModalOpen={editProfileModalOpen}
        setEditProfileModalOpen={setEditProfileModalOpen}
        dataUpdateProfile={dataUpdateProfile}
        setDataUpdateProfile={setDataUpdateProfile}
      />
    </>
  );
};

export default MyAccountPage;
