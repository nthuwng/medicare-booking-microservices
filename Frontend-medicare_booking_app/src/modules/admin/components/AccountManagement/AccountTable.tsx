import { useRef, useState } from "react";
import { Popconfirm, Button, Tag, Tooltip, Space, App } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("vi");
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

import {
  CloudUploadOutlined,
  ExportOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { getAllUsers, lockUserAPI } from "../../services/admin.api";
import type { IManageUser } from "@/types";
import ImportUser from "../Import/ImportUser";

const AccountTable = () => {
  const [openModalImport, setOpenModalImport] = useState(false);
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  });

  const handleLockUser = async (id: string, lock: boolean) => {
    const res = await lockUserAPI(id, lock);
    if (res?.success === true) {
      message.success(
        res?.message || "Cập nhật trạng thái người dùng thành công"
      );
      await actionRef.current?.reload();
    } else {
      message.error(res?.message || "Cập nhật trạng thái người dùng thất bại");
    }
  };

  const columns: ProColumns<IManageUser>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      ellipsis: true,
      render(_, entity) {
        return (
          <a href="#" onClick={(e) => e.preventDefault()}>
            {entity.id}
          </a>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      hideInSearch: true,
      copyable: true,
      ellipsis: true,
    },
    {
      title: "Tìm kiếm email",
      dataIndex: "email",
      hideInTable: true,
      fieldProps: {
        placeholder: "Nhập email để tìm kiếm",
        style: { width: 220 },
        allowClear: true,
      },
    },
    {
      title: "Loại tài khoản",
      dataIndex: "userType",
      valueType: "select",
      valueEnum: {
        DOCTOR: { text: "DOCTOR" },
        PATIENT: { text: "PATIENT" },
        ADMIN: { text: "ADMIN" },
      },
      fieldProps: {
        placeholder: "Loại tài khoản",
        style: { width: 180 },
        showSearch: true,
        allowClear: true,
      },
      render(_, entity) {
        if (entity.userType === "DOCTOR") return <Tag color="blue">DOCTOR</Tag>;
        if (entity.userType === "PATIENT")
          return <Tag color="purple">PATIENT</Tag>;
        return <Tag color="red">ADMIN</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      valueType: "select",
      valueEnum: {
        true: { text: "Đang hoạt động" },
        false: { text: "Không hoạt động" },
      },
      render(_, entity) {
        if (entity.isActive === true)
          return <Tag color="blue">Đang hoạt động</Tag>;
        return <Tag color="red">Không hoạt động</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      hideInSearch: true,
      width: 220,
      render(_, entity) {
        return (
          <Space size="small" wrap className="!flex !justify-between">
            <div>
              {entity.isActive === true ? (
                <Tag color="green">Đang hoạt động</Tag>
              ) : (
                <Tag color="red">Không hoạt động</Tag>
              )}
            </div>

            <div>
              {entity.isActive ? (
                <Tooltip title="Khóa tài khoản">
                  <Button
                    size="small"
                    danger
                    icon={<LockOutlined />}
                    onClick={() => handleLockUser(entity.id, false)}
                  >
                    Khóa
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip title="Mở khóa tài khoản">
                  <Button
                    size="small"
                    type="primary"
                    icon={<UnlockOutlined />}
                    onClick={() => handleLockUser(entity.id, true)}
                  >
                    Mở
                  </Button>
                </Tooltip>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      hideInSearch: true,
      render(_, entity) {
        return dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm");
      },
    },
  ];

  const refreshTable = () => actionRef.current?.reload();

  return (
    <>
      <ProTable<IManageUser>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        headerTitle="Danh sách tài khoản"
        search={{ labelWidth: 120 }}
        request={async (params) => {
          let query = "";
          const page = params?.current || 1;
          const pageSize = params?.pageSize || 10;
          query += `page=${page}&pageSize=${pageSize}`;
          if (params?.email) query += `&email=${params.email}`;
          if (params?.userType) query += `&userType=${params.userType}`;
          if (params?.isActive) query += `&isActive=${params.isActive}`;

          const res = await getAllUsers(query);
          if (res?.data?.meta) setMeta(res.data.meta);

          return {
            data: res?.data?.result || [],
            success: true,
            total: res?.data?.meta?.total || 0,
          };
        }}
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          pageSizeOptions: [5, 10, 20, 50, 100],
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => (
            <div>
              {range[0]}-{range[1]} trên {total} rows
            </div>
          ),
        }}
        toolBarRender={() => [
          <Button key="export" icon={<ExportOutlined />} type="primary">
            Export
          </Button>,
          <Button
            key="import"
            icon={<CloudUploadOutlined />}
            type="primary"
            onClick={() => setOpenModalImport(true)}
          >
            Import
          </Button>,
          <Button key="add" icon={<PlusOutlined />} type="primary">
            Add new
          </Button>,
        ]}
      />

      <ImportUser
        openModalImport={openModalImport}
        setOpenModalImport={setOpenModalImport}
        refreshTable={refreshTable}
      />
    </>
  );
};

export default AccountTable;
