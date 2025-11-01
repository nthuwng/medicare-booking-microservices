import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Tag,
  Typography,
  Badge,
  Skeleton,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  LockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCurrentApp } from "@/components/contexts/app.context";
import { getPatientProfileAPI } from "../services/client.api";
import type { IPatientProfile } from "@/types/user";
import ChangePassword from "../components/MyAccount/ChangePassword";
import UpdateProfile from "../components/MyAccount/UpdateProfile";

const { Title, Text } = Typography;

const MyAccountPage = () => {
  const { user, theme } = useCurrentApp();

  const [loading, setLoading] = useState(false);
  const [patientProfile, setPatientProfile] = useState<IPatientProfile | null>(
    null
  );

  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [dataUpdateProfile, setDataUpdateProfile] =
    useState<IPatientProfile | null>(null);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      setLoading(true);
      const res = await getPatientProfileAPI(user?.id || "");
      if (res?.success) {
        setPatientProfile(res.data as IPatientProfile);
        setDataUpdateProfile(res.data as IPatientProfile);
      }
      setLoading(false);
    };
    if (user?.id) fetchPatientProfile();
  }, [user?.id]);

  useEffect(() => {
    if (dataUpdateProfile) {
      setPatientProfile((prev) => ({
        ...(prev || ({} as IPatientProfile)),
        ...dataUpdateProfile,
      }));
    }
  }, [dataUpdateProfile]);

  // theming helpers
  const cardCls = useMemo(
    () =>
      [
        "!rounded-xl !transition !border !shadow-sm",
        theme === "dark"
          ? "!bg-[#0f1b2d] !border-[#1f2a3a] !text-gray-100"
          : "!bg-white !border-slate-200 !text-slate-900",
      ].join(" "),
    [theme]
  );

  const subtleText = theme === "dark" ? "!text-gray-300" : "!text-gray-600";
  const subtleTextDim = theme === "dark" ? "!text-gray-400" : "!text-gray-500";

  const labelStyle = {
    width: 140,
    color: theme === "dark" ? "#9CA3AF" : "#64748b",
    fontWeight: "!500",
  };
  const contentStyle = {
    color: theme === "dark" ? "#E5E7EB" : "#0f172a",
  };

  const initials =
    patientProfile?.full_name?.trim()?.charAt(0).toUpperCase() ||
    user?.email?.trim()?.charAt(0).toUpperCase() ||
    "U";

  const canChangePassword = user?.authProvider !== "GOOGLE";

  return (
    <>
      {/* HEADER */}
      <Card className={`${cardCls} mb-6`}>
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        ) : (
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Badge dot color="#34d399" offset={[-6, 6]}>
                <Avatar
                  size={96}
                  src={patientProfile?.avatar_url || undefined}
                  style={{
                    backgroundImage: !patientProfile?.avatar_url
                      ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                      : undefined,
                    color: "#fff",
                    fontSize: 40,
                    fontWeight: 700,
                    border: "3px solid rgba(255,255,255,0.85)",
                    boxShadow: "0 8px 24px rgba(37,99,235,.35)",
                  }}
                >
                  {!patientProfile?.avatar_url && initials}
                </Avatar>
              </Badge>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Title
                    level={4}
                    style={{ margin: 0 }}
                    className={theme === "dark" ? "!text-white" : ""}
                  >
                    {patientProfile?.full_name || "patient"}
                  </Title>
                  <Tag color="blue-inverse">Tài khoản</Tag>
                </div>

                <div
                  className={`mt-1 flex items-center gap-x-3 gap-y-1 flex-wrap text-sm ${subtleText}`}
                >
                  <span className="flex items-center gap-1 min-w-0">
                    <MailOutlined />
                    <span className="truncate">
                      {patientProfile?.userInfo?.email || user?.email}
                    </span>
                  </span>
                  {patientProfile?.phone && (
                    <span className="flex items-center gap-1">
                      <PhoneOutlined />
                      {patientProfile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                icon={<EditOutlined />}
                type="primary"
                onClick={() => setOpenEdit(true)}
              >
                Chỉnh sửa hồ sơ
              </Button>
              {canChangePassword && (
                <Button
                  icon={<LockOutlined />}
                  onClick={() => setOpenPassword(true)}
                >
                  Đổi mật khẩu
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card
          title={
            <span className={theme === "dark" ? "!text-white" : ""}>
              Thông tin cá nhân
            </span>
          }
          className={cardCls}
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <Descriptions column={1} size="middle">
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Họ tên
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.full_name || "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Giới tính
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.gender === "Male"
                  ? "Nam"
                  : patientProfile?.gender === "Female"
                  ? "Nữ"
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Ngày sinh
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.date_of_birth
                  ? dayjs(patientProfile.date_of_birth).format("DD/MM/YYYY")
                  : "—"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        {/* Contact */}
        <Card
          title={
            <span className={theme === "dark" ? "!text-white" : ""}>
              Liên hệ
            </span>
          }
          className={cardCls}
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <Descriptions column={1} size="middle">
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Email
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.userInfo?.email || user?.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Số điện thoại
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.phone || "—"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        {/* Address */}
        <Card
          title={
            <span className={theme === "dark" ? "!text-white" : ""}>
              Địa chỉ
            </span>
          }
          className={`${cardCls} md:col-span-2`}
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : (
            <Descriptions column={3} size="middle" bordered>
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Đường
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Quận/Huyện
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.district || "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className={theme === "dark" ? "!text-white" : ""}>
                    Thành phố
                  </span>
                }
                labelStyle={labelStyle}
                contentStyle={contentStyle}
              >
                {patientProfile?.city || "—"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>

        {/* Security */}
        <Card
          title={
            <span className={theme === "dark" ? "!text-white" : ""}>
              Bảo mật
            </span>
          }
          className={cardCls}
        >
          {user?.authProvider === "GOOGLE" ? (
            <Text className={`!text-[16px] ${subtleText}`}>
              Bạn không thể đổi mật khẩu vì tài khoản được đăng nhập bằng
              Google.
            </Text>
          ) : (
            <>
              <Text className={`!text-[16px] ${subtleText}`}>
                Bạn có thể đổi mật khẩu để bảo vệ tài khoản tốt hơn.
              </Text>
              <div className="mt-3">
                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  onClick={() => setOpenPassword(true)}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </>
          )}
          <div className={`mt-3 text-sm ${subtleTextDim}`}>
            * Gợi ý: dùng mật khẩu tối thiểu 8 ký tự gồm chữ hoa, chữ thường và
            số.
          </div>
        </Card>
      </div>

      {/* MODALS */}
      <ChangePassword
        passwordModalOpen={openPassword}
        setPasswordModalOpen={setOpenPassword}
      />
      <UpdateProfile
        loading={loading}
        setLoading={setLoading}
        editProfileModalOpen={openEdit}
        setEditProfileModalOpen={setOpenEdit}
        dataUpdateProfile={dataUpdateProfile}
        setDataUpdateProfile={setDataUpdateProfile}
      />
    </>
  );
};

export default MyAccountPage;
