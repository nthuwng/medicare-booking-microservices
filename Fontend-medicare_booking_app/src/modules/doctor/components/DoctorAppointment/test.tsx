import { useRef, useState } from "react";
import {
  Popconfirm,
  Button,
  Tag,
  Space,
  Avatar,
  Typography,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("vi");
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
import {
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  EyeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { getAllAppointmentsByDoctorId } from "../../services/doctor.api";
import type { IAppointment } from "@/types";
import { useCurrentApp } from "@/components/contexts/app.context";

const { Text } = Typography;

const TableAppointment = () => {
  const actionRef = useRef<ActionType>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IAppointment | null>(
    null
  );
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  });

  const { user } = useCurrentApp();

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  // Hàm tạo màu sắc cho trạng thái cuộc hẹn
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "NO_SHOW":
        return "volcano";
      default:
        return "default";
    }
  };

  // Hàm tạo text hiển thị cho trạng thái
  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "NO_SHOW":
        return "Không đến";
      default:
        return status;
    }
  };

  // Hàm tạo màu sắc cho trạng thái thanh toán
  const getPaymentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "green";
      case "UNPAID":
        return "red";
      case "REFUNDED":
        return "purple";
      default:
        return "default";
    }
  };

  // Hàm tạo text hiển thị cho trạng thái thanh toán
  const getPaymentStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "Đã thanh toán";
      case "UNPAID":
        return "Chưa thanh toán";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const columns: ProColumns<IAppointment>[] = [
    {
      title: "Mã cuộc hẹn",
      dataIndex: "id",
      width: 120,
      hideInSearch: true,
      render(_, entity) {
        return (
          <Tooltip title="Nhấn để xem chi tiết">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDataViewDetail(entity);
                setOpenViewDetail(true);
              }}
              style={{
                color: "#1890ff",
                fontWeight: 500,
              }}
            >
              #{entity.id.slice(-8)}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: "Thông tin bệnh nhân",
      dataIndex: "patient",
      width: 280,
      hideInSearch: true,
      render(_, entity) {
        const patient = entity.patient;
        if (!patient) return <Text type="secondary">Không có thông tin</Text>;

        return (
          <div style={{ padding: "8px 0" }}>
            <Space direction="vertical" size={4}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#87d068" }}
                />
                <div>
                  <Text strong style={{ fontSize: "14px" }}>
                    {patient.patientName}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {patient.patientGender === "MALE" ? "Nam" : "Nữ"} •
                    {dayjs().diff(dayjs(patient.patientDateOfBirth), "year")}{" "}
                    tuổi
                  </Text>
                </div>
              </div>
              <div style={{ marginLeft: 40 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <PhoneOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "12px" }}>
                    {patient.patientPhone}
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MailOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "12px" }}>
                    {patient.patientEmail}
                  </Text>
                </div>
              </div>
            </Space>
          </div>
        );
      },
    },
    {
      title: "Tìm kiếm bệnh nhân",
      dataIndex: "patientName",
      hideInTable: true,
      fieldProps: {
        placeholder: "Nhập tên bệnh nhân để tìm kiếm",
        style: {
          width: "250px",
        },
      },
    },
    {
      title: "Ngày & Giờ hẹn",
      dataIndex: "appointmentDateTime",
      width: 180,
      hideInSearch: true,
      render(_, entity) {
        const appointmentDate = dayjs(entity.appointmentDateTime);
        const isToday = appointmentDate.isSame(dayjs(), "day");
        const isPast = appointmentDate.isBefore(dayjs());

        return (
          <div style={{ padding: "8px 0" }}>
            <Space direction="vertical" size={4}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CalendarOutlined
                  style={{ color: isToday ? "#52c41a" : "#1890ff" }}
                />
                <Text
                  strong={isToday}
                  style={{
                    color: isToday ? "#52c41a" : isPast ? "#ff4d4f" : "#333",
                    fontSize: "13px",
                  }}
                >
                  {appointmentDate.format("DD/MM/YYYY")}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: 2,
                }}
              >
                <ClockCircleOutlined
                  style={{ fontSize: "12px", color: "#666" }}
                />
                <Text style={{ fontSize: "12px" }}>
                  {appointmentDate.format("HH:mm")}
                </Text>
              </div>
              {isToday && (
                <Tag color="green" style={{ fontSize: "10px", margin: 0 }}>
                  Hôm nay
                </Tag>
              )}
            </Space>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      hideInSearch: true,
      render(dom, entity) {
        return (
          <Space direction="vertical" size={4}>
            <Tag
              color={getStatusColor(entity.status)}
              style={{
                fontWeight: 500,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {getStatusText(entity.status)}
            </Tag>
            <Tag
              color={getPaymentStatusColor(entity.paymentStatus)}
              style={{
                fontWeight: 500,
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
              }}
            >
              <DollarOutlined style={{ fontSize: "10px", marginRight: 2 }} />
              {getPaymentStatusText(entity.paymentStatus)}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Phí khám",
      dataIndex: "totalFee",
      width: 100,
      hideInSearch: true,
      render(dom, entity) {
        return (
          <div style={{ textAlign: "center" }}>
            <Text strong style={{ color: "#52c41a", fontSize: "14px" }}>
              {new Intl.NumberFormat("vi-VN").format(parseInt(entity.totalFee))}
              đ
            </Text>
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 130,
      hideInSearch: true,
      render(dom, entity) {
        return (
          <div>
            <Text style={{ fontSize: "12px" }}>
              {dayjs(entity.createdAt).format("DD/MM/YYYY")}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {dayjs(entity.createdAt).format("HH:mm")}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      width: 120,
      fixed: "right",
      hideInSearch: true,
      render(dom, entity) {
        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setDataViewDetail(entity);
                  setOpenViewDetail(true);
                }}
                style={{ color: "#1890ff" }}
              />
            </Tooltip>

            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                icon={<EditTwoTone twoToneColor="#f57800" />}
                onClick={() => {
                  // Handle edit action
                }}
              />
            </Tooltip>

            <Popconfirm
              placement="leftTop"
              title="Xác nhận hủy cuộc hẹn"
              description="Bạn có chắc chắn muốn hủy cuộc hẹn này không?"
              onConfirm={() => {
                // Handle cancel appointment
              }}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Tooltip title="Hủy cuộc hẹn">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteTwoTone twoToneColor="#ff4d4f" />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<IAppointment>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        scroll={{ x: 1200 }}
        size="middle"
        search={{
          labelWidth: 120,
          searchText: "Tìm kiếm",
          resetText: "Làm mới",
          collapseRender: (collapsed) => (collapsed ? "Mở rộng" : "Thu gọn"),
          optionRender: (searchConfig, formProps, dom) => [
            <Button
              key="search"
              type="primary"
              onClick={() => formProps?.form?.submit()}
              style={{ marginRight: 8 }}
            >
              Tìm kiếm
            </Button>,
            <Button key="reset" onClick={() => formProps?.form?.resetFields()}>
              Làm mới
            </Button>,
          ],
        }}
        request={async (params, sort, filter) => {
          let query = "";
          if (params) {
            query += `${user?.id}?page=${params.current}&pageSize=${params.pageSize}`;

            // Thêm tham số tìm kiếm nếu có
            if (params.patientName) {
              query += `&patientName=${encodeURIComponent(params.patientName)}`;
            }
          }
          const res = await getAllAppointmentsByDoctorId(query);
          if (res.data) {
            setMeta(res.data.meta);
          }
          return {
            data: res.data?.result ?? [],
            page: 1,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          pageSizeOptions: ["10", "20", "50", "100"],
          showQuickJumper: true,
          showTotal: (total, range) => (
            <div style={{ color: "#666", fontSize: "14px" }}>
              Hiển thị {range[0]}-{range[1]} trong tổng số {total} cuộc hẹn
            </div>
          ),
        }}
        headerTitle={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#333" }}>
              Danh sách cuộc hẹn của tôi
            </span>
          </div>
        }
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            type="default"
            style={{
              borderColor: "#52c41a",
              color: "#52c41a",
            }}
          >
            Xuất Excel
          </Button>,
          <Button
            key="refresh"
            onClick={() => refreshTable()}
            style={{
              borderColor: "#1890ff",
              color: "#1890ff",
            }}
          >
            Làm mới
          </Button>,
        ]}
        tableAlertRender={({
          selectedRowKeys,
          selectedRows,
          onCleanSelected,
        }) => (
          <Space size={16}>
            <span>Đã chọn {selectedRowKeys.length} cuộc hẹn</span>
            <Button size="small" onClick={onCleanSelected}>
              Bỏ chọn
            </Button>
          </Space>
        )}
        tableAlertOptionRender={({ selectedRowKeys, selectedRows }) => (
          <Space size={8}>
            <Button
              size="small"
              type="primary"
              disabled={selectedRowKeys.length === 0}
            >
              Xác nhận hàng loạt
            </Button>
            <Button size="small" danger disabled={selectedRowKeys.length === 0}>
              Hủy hàng loạt
            </Button>
          </Space>
        )}
        rowSelection={{
          type: "checkbox",
          preserveSelectedRowKeys: true,
        }}
        options={{
          setting: {
            listsHeight: 400,
            checkable: true,
          },
          fullScreen: true,
          reload: true,
          density: true,
        }}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />
    </>
  );
};

export default TableAppointment;
