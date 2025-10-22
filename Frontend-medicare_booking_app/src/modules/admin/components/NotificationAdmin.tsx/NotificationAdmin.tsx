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
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "@/sockets/admin.socket";
import NotificationModal from "./NotificationModal";
import type { INotificationDataAdmin } from "@/types";
import {
  getNotificationByUserId,
  markAsReadNotification,
} from "../../services/admin.api";

const { Title, Text } = Typography;

interface IProps {
  setModalNotificationLayout: (v: boolean) => void;
  modalNotificationLayout: boolean;
}

const NotificationAdmin = (props: IProps) => {
  const { modalNotificationLayout, setModalNotificationLayout } = props;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModalNotification, setOpenModalNotification] = useState(false);
  const [dataNotificationModal, setDataNotificationModal] =
    useState<INotificationDataAdmin | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationByUserId("admin");

      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]); // không có thì để mảng rỗng
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotifications([]); // coi 404 là empty
      } else {
        console.error("Error fetching notifications:", err);
        message.error("Không thể tải thông báo");
      }
    } finally {
      setLoading(false);
    }
  };

  // SOCKET + API SETUP
  useEffect(() => {
    fetchNotifications();
    const socketConnection = connectAdminSocket();

    socketConnection.emit("join-admin-room");

    // Listen for doctor registration notifications
    const isValidNotification = (n: any) =>
      n && typeof n === "object" && "id" in n && "title" in n;

    const handleDoctorRegistration = (payload: any) => {
      const notif = payload?.notification;

      if (!isValidNotification(notif)) {
        // payload không chuẩn → đồng bộ lại từ server cho chắc
        fetchNotifications();
        return;
      }

      setNotifications((prev) => [notif, ...prev.filter(Boolean)]);
    };

    socketConnection.on("doctor.registered", handleDoctorRegistration);

    socketConnection.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      message.error("Lỗi kết nối thông báo realtime");
    });

    return () => {
      socketConnection.off("doctor.registered", handleDoctorRegistration);

      disconnectAdminSocket(socketConnection);
    };
  }, []);

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

  const handleNotificationClick = (notification: INotificationDataAdmin) => {
    setDataNotificationModal(notification);
    setOpenModalNotification(true);
    setModalNotificationLayout(false);
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
    if (type === "APPOINTMENT")
      return <BellOutlined style={{ color: "#52c41a" }} />;
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

      {/* Modal */}
      <NotificationModal
        openModalNotification={openModalNotification}
        setOpenModalNotification={setOpenModalNotification}
        dataNotificationModal={dataNotificationModal}
        setDataNotificationModal={setDataNotificationModal}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
};

export default NotificationAdmin;
