import React, { useState } from "react";
import "./layout.doctor.css";
import {
  AppstoreOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space } from "antd";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import type { MenuProps } from "antd";
import { RiAdminFill } from "react-icons/ri";
import { MdAccountCircle } from "react-icons/md";
import NotificationDoctor from "@/modules/doctor/components/NotificationDoctor/NotificationDoctor";
import { IoCalendarOutline } from "react-icons/io5";

type MenuItem = Required<MenuProps>["items"][number];

const { Content, Footer, Sider } = Layout;

const LayoutDoctor = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [modalNotificationLayout, setModalNotificationLayout] = useState(false);

  const handleLogout = async () => {
    //todo
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
      label: <Link to="/doctor/profile-settings">Profile Settings</Link>,
      key: "profile-settings",
      icon: <MdAccountCircle size={20} />,
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
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
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
          <div className="sidebar-logo">Doctor Dashboard</div>
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
              {React.createElement(
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
                <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
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

export default LayoutDoctor;
