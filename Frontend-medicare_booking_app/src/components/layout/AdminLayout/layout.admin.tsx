import { createElement, useState } from "react";
import "./layout.admin.css";
import {
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Users } from "lucide-react";
import { Layout, Menu, Dropdown, Space } from "antd";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import type { MenuProps } from "antd";
import { RiAdminFill } from "react-icons/ri";
import { FaClock, FaUserDoctor } from "react-icons/fa6";
import { AiOutlineUser } from "react-icons/ai";
import { LiaClinicMedicalSolid } from "react-icons/lia";
import { MdAccountCircle } from "react-icons/md";
import NotificationAdmin from "@/modules/admin/components/NotificationAdmin.tsx/NotificationAdmin";
import { FaUserInjured } from "react-icons/fa";
import { useCurrentApp } from "@/components/contexts/app.context";
type MenuItem = Required<MenuProps>["items"][number];

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [modalNotificationLayout, setModalNotificationLayout] = useState(false);

  const { setIsAuthenticated, setUser } = useCurrentApp();

  const handleLogout = () => {
    // Xóa token từ localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Reset trạng thái
    setIsAuthenticated(false);
    setUser(null);
  };

  const items: MenuItem[] = [
    {
      label: <Link to="/admin">Dashboard</Link>,
      key: "dashboard",
      icon: <AppstoreOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: <Link to="/admin/account-management">Account Manage</Link>,
      key: "account-management",
      icon: <MdAccountCircle size={20} />,
    },
    {
      label: <span>User Profiles</span>,
      key: "user",
      icon: <Users size={20} />,
      children: [
        {
          label: <Link to="/admin/admin-management">Admin</Link>,
          key: "admin-management",
          icon: <RiAdminFill />,
        },
        {
          label: <Link to="/admin/doctor-management">Doctor</Link>,
          key: "doctor-management",
          icon: <FaUserDoctor />,
        },
        {
          label: <Link to="/admin/patient-management">Patient</Link>,
          key: "patient-management",
          icon: <FaUserInjured />,
        },
      ],
    },
    {
      label: <Link to="/admin/specialities">Specialities</Link>,
      key: "specialities",
      icon: <AiOutlineUser size={20} />,
    },
    {
      label: <Link to="/admin/clinic">Clinic</Link>,
      key: "clinic",
      icon: <LiaClinicMedicalSolid size={20} />,
    },
    {
      label: <Link to="/admin/time-slot-management">Time Slot</Link>,
      key: "time-slot-management",
      icon: <FaClock size={20} />,
    },
  ];

  const itemsDropdown = [
    {
      label: <Link to={"/"}>Trang chủ</Link>,
      key: "home",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => alert("me")}>
          Quản lý tài khoản
        </label>
      ),
      key: "account",
    },
    {
      // background: #e0f2fe !important;
      // color: #1677ff !important;
      // box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
      // transform: scale(1.04);
      label: (
        <Link to={"/"} onClick={() => handleLogout()}>
          Đăng xuất
        </Link>
      ),
      key: "logout",
    },
  ];

  return (
    <>
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="sidebar-logo">Admin Dashboard</div>
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
                <NotificationAdmin
                  setModalNotificationLayout={setModalNotificationLayout}
                  modalNotificationLayout={modalNotificationLayout}
                />
              </div>
              {/* User Dropdown */}
              <div className="notification-icon">
                <Dropdown
                  menu={{ items: itemsDropdown }}
                  trigger={["click"]}
                  overlayClassName="admin-user-dropdown"
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
    </>
  );
};

export default LayoutAdmin;
