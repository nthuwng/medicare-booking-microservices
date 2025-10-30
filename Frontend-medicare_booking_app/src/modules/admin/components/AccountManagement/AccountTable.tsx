import { useRef, useState } from "react";
import { Popconfirm, Button, Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("vi");
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
import {
  CloudUploadOutlined,
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { getAllUsers } from "../../services/admin.api";
import type { IManageUser } from "@/types";
import ImportUser from "../Import/ImportUser";

const AccountTable = () => {
  const [openModalImport, setOpenModalImport] = useState<boolean>(false);

  const actionRef = useRef<ActionType>(null);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  });
  const columns: ProColumns<IManageUser>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render(_, entity) {
        return (
          <a
            href="#"
            onClick={() => {
              // setDataViewDetail(entity);
              // setOpenViewDetail(true);
            }}
          >
            {entity.id}
          </a>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      hideInSearch: true,
    },
    {
      title: "Tìm kiếm email",
      dataIndex: "email",
      hideInTable: true,
      fieldProps: {
        placeholder: "Nhập email để tìm kiếm",
        style: {
          width: "200px",
        },
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      hideInSearch: true,
      render(_, entity) {
        return entity.isActive ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Đã khóa</Tag>
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
    {
      title: "Action",
      hideInSearch: true,
      render(_) {
        return (
          <>
            <EditTwoTone
              twoToneColor="#f57800"
              style={{
                cursor: "pointer",
                fontSize: 16,
                marginRight: 10,
              }}
              onClick={() => {}}
            />

            {/* Xóa */}
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa chuyên khoa"}
              description={"Bạn có chắc chắn muốn xóa chuyên khoa này ?"}
              onConfirm={() => {}}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <DeleteTwoTone
                twoToneColor="#ff4d4f"
                style={{
                  cursor: "pointer",
                  fontSize: 16,
                }}
              />
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable<IManageUser>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          let query = "";
          if (params) {
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            query += `page=${page}&pageSize=${pageSize}`;
            if (params.email) {
              query += `&email=${params.email}`;
            }
          }
          const res = await getAllUsers(query);
          if (res?.data?.meta) {
            setMeta(res.data.meta);
          }
          return {
            data: res.data?.result || [],
            success: true,
            total: res.data?.meta?.total || 0,
          };
        }}
        rowKey="id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          pageSizeOptions: [5, 10, 20, 50, 100],
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => {
            return (
              <div>
                {" "}
                {range[0]}-{range[1]} trên {total} rows
              </div>
            );
          },
        }}
        headerTitle="Danh sách tài khoản"
        toolBarRender={() => [
          <Button icon={<ExportOutlined />} type="primary">
            Export
          </Button>,
          <Button
            icon={<CloudUploadOutlined />}
            type="primary"
            onClick={() => setOpenModalImport(true)}
          >
            Import
          </Button>,
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              // setOpenModalCreate(true);
            }}
            type="primary"
          >
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
