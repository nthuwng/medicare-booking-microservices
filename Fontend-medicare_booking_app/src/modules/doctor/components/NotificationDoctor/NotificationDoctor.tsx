import {
  Dropdown,
  List,
  Avatar,
  Typography,
  Badge,
  Button,
  Empty,
  message,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  CheckOutlined,
  DeleteOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "@/sockets/admin.socket";
import {
  getNotificationByUserId,
  markAsReadNotification,
} from "../../services/doctor.api";
import { useCurrentApp } from "@/components/contexts/app.context";
import type { INotificationDataAdmin } from "@/types";
import AppointmentStatusModal from "./AppointmentStatusModal";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface IProps {
  setModalNotificationLayout: (v: boolean) => void;
  modalNotificationLayout: boolean;
}

const NotificationDoctor = (props: IProps) => {
  const { modalNotificationLayout, setModalNotificationLayout } = props;
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [openModalAppointmentStatus, setOpenModalAppointmentStatus] =
    useState(false);
  const [
    dataNotificationAppointmentStatus,
    setDataNotificationAppointmentStatus,
  ] = useState<INotificationDataAdmin | null>(null);
  const { user } = useCurrentApp();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotificationByUserId(user?.id || "");

      if (response && response.success) {
        setNotifications(response.data || []);
      } else {
        console.error("Failed to fetch notifications:", response.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  // SOCKET + API SETUP
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();

    // 1) kết nối socket doctor
    const socket = connectAdminSocket();

    // 2) join phòng riêng theo userId
    socket.emit("join-doctor-room", { userId: user.id });

    // 3) nhận realtime và cập nhật badge + list ngay (không cần bấm chuông)
    const isValidNotification = (n: any) =>
      n && typeof n === "object" && "id" in n && "title" in n;

    const onApproved = (payload: any) => {
      const notif = payload?.notification;

      if (!isValidNotification(notif)) {
        // payload không chuẩn → đồng bộ lại từ server cho chắc
        fetchNotifications();
        return;
      }

      setNotifications((prev) => [notif, ...prev.filter(Boolean)]);
    };

    const onAppointmentCreated = (payload: any) => {
      const notif = payload?.notification;
      if (!isValidNotification(notif)) {
        fetchNotifications();
        return;
      }

      setNotifications((prev) => [notif, ...prev.filter(Boolean)]);
    };

    const onMessageCreated = (payload: any) => {
      const notif = payload?.notification;
      if (!isValidNotification(notif)) {
        fetchNotifications();
        return;
      }

      setNotifications((prev) => [notif, ...prev.filter(Boolean)]);
    };

    socket.on("doctor.approved", onApproved);
    socket.on("appointment.created", onAppointmentCreated);
    socket.on("message.created", onMessageCreated);
    socket.on("connect_error", (err) => console.error("socket error", err));

    return () => {
      socket.off("doctor.approved", onApproved);
      socket.off("appointment.created", onAppointmentCreated);
      socket.off("message.created", onMessageCreated);
      disconnectAdminSocket(socket);
    };
  }, [user?.id]);

  // Re-fetch khi dropdown mở
  useEffect(() => {
    if (modalNotificationLayout) {
      fetchNotifications();
    }
  }, [modalNotificationLayout]);
  // Calculate unread count
  const unreadCount = (
    Array.isArray(notifications) ? notifications : []
  ).filter((n) => n && !n.read).length;

  const handleNotificationClick = async (
    notification: INotificationDataAdmin
  ) => {
    setModalNotificationLayout(false);

    // mark as read (optimistic)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    try {
      await markAsReadNotification(notification.id);
    } catch {}

    if (notification.type === "DOCTOR_APPROVED") {
      // bắn event để Profile refetch, không F5
      window.dispatchEvent(
        new CustomEvent("doctor:profile-refresh", {
          detail: { userId: user?.id },
        })
      );
      navigate(`/doctor/profile-settings`);
      return; // không cần mở modal gì cả cho case này
    }
    if (notification.type === "MESSAGE_CREATED") {
      // bắn event để Profile refetch, không F5
      window.dispatchEvent(
        new CustomEvent("doctor:message-refresh", {
          detail: { userId: user?.id },
        })
      );
      navigate(`/doctor/messages`);
      return; // không cần mở modal gì cả cho case này
    }

    if (notification.type === "APPOINTMENT_CREATED") {
      setOpenModalAppointmentStatus(true);
      setDataNotificationAppointmentStatus(notification);
      return;
    }
  };
  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    try {
      await markAsReadNotification(notificationId);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    // TODO: Call API to mark all as read on server
  };

  // Handle clear all notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
    // TODO: Call API to clear all notifications on server
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString("vi-VN");
  };

  const getIcon = (type: string) => {
    if (type === "DOCTOR_REGISTRATION")
      return <UserOutlined style={{ color: "#1890ff" }} />;
    if (type === "APPOINTMENT_CREATED")
      return <BellOutlined style={{ color: "#52c41a" }} />;
    if (type === "MESSAGE_CREATED")
      return <MessageOutlined style={{ color: "#52c41a" }} />;
    return <BellOutlined />;
  };

  const dropdownContent = (
    <div
      style={{
        width: 380,
        maxHeight: 500,
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        overflow: "hidden",
        border: "1px solid #f0f0f0",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Title level={5} style={{ margin: 0, fontSize: "16px" }}>
              Thông báo
            </Title>
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                style={{ backgroundColor: "#ff4d4f" }}
                size="small"
              />
            )}
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              style={{ color: "#52c41a" }}
              title="Đánh dấu tất cả đã đọc"
              onClick={handleMarkAllAsRead}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              style={{ color: "#ff4d4f" }}
              title="Xóa tất cả"
              onClick={handleClearAllNotifications}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: "360px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "30px 0", textAlign: "center" }}>
            Đang tải...
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="Không có thông báo nào"
            style={{ padding: "30px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "12px 20px",
                  backgroundColor: !item.read ? "#f6ffed" : "transparent",
                  borderLeft: !item.read
                    ? "3px solid #52c41a"
                    : "3px solid transparent",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  borderBottom: "1px solid #f5f5f5",
                  margin: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !item.read
                    ? "#f6ffed"
                    : "transparent";
                }}
                onClick={() => {
                  handleMarkAsRead(item.id);
                  handleNotificationClick(item);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.read} color="#52c41a" size="small">
                      <Avatar
                        size={36}
                        icon={getIcon(item.type)}
                        style={{
                          backgroundColor: !item.read ? "#e6f7ff" : "#f5f5f5",
                          border: "1px solid #d9d9d9",
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        width: "100%",
                      }}
                    >
                      <Text
                        strong={!item.read}
                        style={{
                          fontSize: "13px",
                          color: !item.read ? "#262626" : "#595959",
                          flex: 1,
                          marginRight: "8px",
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "11px",
                          flexShrink: 0,
                          minWidth: "fit-content",
                        }}
                      >
                        {formatTime(item.createdAt)}
                      </Text>
                    </div>
                  }
                  description={
                    <Text
                      style={{
                        fontSize: "12px",
                        color: !item.read ? "#595959" : "#8c8c8c",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.message}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 20px",
          borderTop: "1px solid #f0f0f0",
          background: "#fafafa",
          textAlign: "center",
        }}
      >
        <Button
          type="link"
          size="small"
          style={{
            color: "#1890ff",
            padding: 0,
            fontSize: "12px",
          }}
        >
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        open={modalNotificationLayout}
        onOpenChange={setModalNotificationLayout}
        dropdownRender={() => dropdownContent}
        placement="bottomRight"
        trigger={["click"]}
        arrow={{ pointAtCenter: true }}
        overlayStyle={{
          position: "fixed",
          zIndex: 1050,
        }}
      >
        <Badge count={unreadCount} size="small" offset={[-10, 5]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "20px" }} />}
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
              padding: "8px",
              height: "40px",
              width: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Badge>
      </Dropdown>

      <AppointmentStatusModal
        openModalAppointmentStatus={openModalAppointmentStatus}
        setOpenModalAppointmentStatus={setOpenModalAppointmentStatus}
        dataNotificationAppointmentStatus={dataNotificationAppointmentStatus}
      />
    </>
  );
};

export default NotificationDoctor;
