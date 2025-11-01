import { createElement, useState, useEffect } from "react";
import "./layout.doctor.css";
import {
  AppstoreOutlined,
  CalendarOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Dropdown,
  Space,
  Avatar,
  Image,
  Tag,
  Modal,
  Upload,
  Button,
  App,
} from "antd";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import type { MenuProps } from "antd";
import { RiAdminFill } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";
import NotificationDoctor from "@/modules/doctor/components/NotificationDoctor/NotificationDoctor";
import { IoCalendarOutline } from "react-icons/io5";
import { useCurrentApp } from "@/components/contexts/app.context";
import {
  getDoctorProfileByUserId,
  updateDoctorAvatarAPI,
  uploadFileAPI,
} from "@/modules/doctor/services/doctor.api";
import type { IDoctorProfile } from "@/types";

type MenuItem = Required<MenuProps>["items"][number];

const { Content, Sider } = Layout;
const LayoutDoctor = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [modalNotificationLayout, setModalNotificationLayout] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<IDoctorProfile | null>(
    null
  );
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarFileList, setAvatarFileList] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const { setIsAuthenticated, setUser, user } = useCurrentApp();
  const { message } = App.useApp();

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (user?.id) {
        try {
          const res = await getDoctorProfileByUserId(user.id);
          if (res?.data) {
            setDoctorProfile(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch doctor profile:", error);
        }
      }
    };

    fetchDoctorProfile();
  }, [user?.id]);

  const handleLogout = () => {
    // Xóa token từ localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Reset trạng thái
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleOpenAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setAvatarFileList([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFileList.length) {
      message.warning("Vui lòng chọn ảnh trước.");
      return;
    }
    const file = avatarFileList[0]?.originFileObj as File | undefined;
    if (!file) {
      message.error("Không tìm thấy file hợp lệ.");
      return;
    }
    try {
      setIsUploading(true);
      const res = await uploadFileAPI(file);
      const avatar_url = res?.data?.url;
      const avatar_public_id = res?.data?.public_id;
      if (res?.success === true && avatar_url) {
        const resUpdateAvatar = await updateDoctorAvatarAPI(
          user?.id || "",
          avatar_url,
          avatar_public_id || ""
        );
        if (resUpdateAvatar?.success === true) {
          // Update UI immediately without reload
          setDoctorProfile((prev) =>
            prev ? { ...prev, avatarUrl: avatar_url } : prev
          );
          message.success("Cập nhật ảnh đại diện thành công.");
          handleCloseAvatarModal();
        } else {
          message.error(
            resUpdateAvatar?.message || "Cập nhật ảnh đại diện thất bại."
          );
        }
      }
    } catch (e: any) {
      message.error(e?.message || "Có lỗi xảy ra khi tải ảnh.");
    } finally {
      setIsUploading(false);
    }
  };
  const items: MenuItem[] = [
    {
      label: <Link to="/doctor">Dashboard</Link>,
      key: "dashboard",
      icon: <AppstoreOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: <Link to="/doctor/schedule">Schedule</Link>,
      key: "schedule",
      icon: <CalendarOutlined style={{ fontSize: "17px" }} />,
    },
    {
      label: <Link to="/doctor/appointments">Appointments</Link>,
      key: "appointments",
      icon: <IoCalendarOutline style={{ fontSize: "17px" }} />,
    },
    {
      label: <Link to="/doctor/messages">Messages</Link>,
      key: "messages",
      icon: <MessageOutlined style={{ fontSize: "17px" }} />,
    },
    {
      label: <Link to="/doctor/ratings">Ratings</Link>,
      key: "ratings",
      icon: <StarFilled style={{ fontSize: "17px" }} />,
    },
    {
      label: <Link to="/doctor/profile-settings">Profile Settings</Link>,
      key: "profile-settings",
      icon: <MdAccountCircle size={20} />,
    },
    {
      label: <Link to="/doctor/change-password">Change Password</Link>,
      key: "change-password",
      icon: <LockOutlined style={{ fontSize: "17px" }} />,
    },
  ];

  const itemsDropdown = [
    {
      label: <Link to={"/"}>Trang chủ</Link>,
      key: "home",
    },
    {
      label: (
        <Link to={"/"} onClick={() => handleLogout()}>
          Đăng xuất
        </Link>
      ),
      key: "logout",
    },
  ];

  const renderTitleTag = (title: IDoctorProfile["title"]) => {
    const tagStyle = {
      padding: "4px 12px",
      fontSize: "12px",
      fontWeight: 500,
    };

    switch (title) {
      case "BS":
        return (
          <Tag color="blue" style={tagStyle}>
            Bác sĩ
          </Tag>
        );
      case "ThS":
        return (
          <Tag color="green" style={tagStyle}>
            Thạc sĩ
          </Tag>
        );
      case "TS":
        return (
          <Tag color="purple" style={tagStyle}>
            Tiến sĩ
          </Tag>
        );
      case "PGS":
        return (
          <Tag color="orange" style={tagStyle}>
            Phó Giáo sư
          </Tag>
        );
      case "GS":
        return (
          <Tag color="red" style={tagStyle}>
            Giáo sư
          </Tag>
        );
      default:
        return <Tag style={tagStyle}>{title}</Tag>;
    }
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          {collapsed ? (
            <div className="sidebar-logo">Doctor</div>
          ) : (
            <div className="sidebar-logo">Doctor Dashboard</div>
          )}

          {!collapsed && doctorProfile && (
            <>
              <div
                style={{
                  margin: "5px 12px",
                  padding: "10px 12px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                  background:
                    "radial-gradient(125% 125% at 50% 90%, #fff 40%, #7EC0EE 100%)",
                }}
              >
                <Space
                  direction="vertical"
                  size={16}
                  style={{ width: "100%", textAlign: "center" }}
                >
                  {/* Avatar / Image with preview */}
                  {previewUrl || doctorProfile.avatarUrl ? (
                    <div className="doctor-avatar-wrap">
                      <Image
                        src={previewUrl || doctorProfile.avatarUrl}
                        width={100}
                        height={100}
                        style={{
                          objectFit: "cover",
                          borderRadius: "50%",
                          transition: "transform 0.2s",
                          border: "4px solid #ffffff",
                        }}
                        preview={{
                          visible: isAvatarPreviewOpen,
                          src: previewUrl || doctorProfile.avatarUrl,
                          onVisibleChange: (v) => setIsAvatarPreviewOpen(v),
                        }}
                        onClick={() => setIsAvatarPreviewOpen(true)}
                      />
                    </div>
                  ) : (
                    <Avatar
                      size={100}
                      style={{
                        flexShrink: 0,
                        backgroundImage:
                          "linear-gradient(135deg, #1890ff, #096dd9)",
                        color: "#fff",
                        fontSize: "40px",
                        fontWeight: "600",
                        border: "4px solid #ffffff",
                        boxShadow: "0 8px 24px rgba(24, 144, 255, 0.2)",
                        transition: "transform 0.2s",
                      }}
                    >
                      {doctorProfile.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Button size="small" onClick={handleOpenAvatarModal}>
                    Đổi ảnh
                  </Button>

                  {/* Name */}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#1a202c",
                      textAlign: "center",
                      lineHeight: "1.4",
                    }}
                  >
                    {doctorProfile.fullName}
                  </div>

                  {/* Title and Status Tags */}
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ width: "100%" }}
                  >
                    <div>{renderTitleTag(doctorProfile.title)}</div>
                    <Tag
                      color={
                        doctorProfile.approvalStatus === "Approved"
                          ? "green"
                          : "orange"
                      }
                      style={{
                        fontSize: "12px",
                        padding: "4px 12px",
                        fontWeight: 500,
                      }}
                    >
                      {doctorProfile.approvalStatus === "Approved"
                        ? "✓ Đã duyệt"
                        : "⏳ Chưa duyệt"}
                    </Tag>
                  </Space>
                </Space>
              </div>
            </>
          )}
          <Menu
            defaultSelectedKeys={[activeMenu]}
            mode="inline"
            items={items}
            onClick={(e) => setActiveMenu(e.key)}
            className="admin-menu"
          />
        </Sider>
        <Layout>
          <div className="admin-header">
            <span>
              {createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                }
              )}
            </span>
            <div className="header-icons-container">
              {/* Notification - tích hợp trực tiếp */}
              <div className="notification-icon">
                <NotificationDoctor
                  setModalNotificationLayout={setModalNotificationLayout}
                  modalNotificationLayout={modalNotificationLayout}
                />
              </div>
              {/* User Dropdown */}
              <div className="notification-icon">
                <Dropdown
                  menu={{ items: itemsDropdown }}
                  trigger={["click"]}
                  overlayClassName="doctor-user-dropdown"
                >
                  <Space style={{ cursor: "pointer" }}>
                    <RiAdminFill fontSize={20} />
                  </Space>
                </Dropdown>
              </div>
            </div>
          </div>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Cập nhật ảnh đại diện"
        width={"25vw"}
        open={isAvatarModalOpen}
        onOk={handleUploadAvatar}
        okText={isUploading ? "Đang tải..." : "Xác nhận"}
        okButtonProps={{ disabled: isUploading }}
        onCancel={handleCloseAvatarModal}
        cancelButtonProps={{ disabled: isUploading }}
        destroyOnClose
        style={{ top: 50 }}
      >
        <Upload
          listType="picture-card"
          fileList={avatarFileList}
          beforeUpload={() => false}
          maxCount={1}
          onChange={({ fileList }) => {
            setAvatarFileList(fileList);
            if (fileList.length) {
              const f = fileList[0].originFileObj as File | undefined;
              if (f) {
                const url = URL.createObjectURL(f);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(url);
              }
            } else {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(undefined);
            }
          }}
        >
          {avatarFileList.length >= 1 ? null : <div>Chọn ảnh</div>}
        </Upload>
        {previewUrl && (
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <img
              src={previewUrl}
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default LayoutDoctor;
