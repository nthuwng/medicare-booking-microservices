import { useRef, useState } from "react";
import { Popconfirm, Button, App, Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import {
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { getAllAdminsProfile, getAllUsers } from "../../services/admin.api";
import type { IAdminProfile, IManageUser } from "../../types";

const AdminTable = () => {
  const actionRef = useRef<ActionType>(null);
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<IAdminProfile>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
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
      width: 300,
    },
    {
      title: "Tên",
      dataIndex: "full_name",
      width: 150,
      fieldProps: {
        placeholder: "Nhập tên để tìm kiếm",
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      fieldProps: {
        placeholder: "Nhập số điện thoại để tìm kiếm",
        style: {
          width: "250px",
        },
      },
    },

    {
      title: "Ảnh đại diện",
      dataIndex: "avatar_url",
      hideInSearch: true,
      // render(dom, entity, index, action, schema) {
      //   return <Image src={entity.avatarUrl} alt="avatar" />;
      // },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
        return dayjs
          .utc(entity.created_at)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm");
      },
    },

    {
      title: "Action",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
        return (
          <>
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", margin: "0 5px" }}
              onClick={() => {}}
            />

            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa tài khoản"}
              description={"Bạn có chắc chắn muốn xóa tài khoản này ?"}
              onConfirm={() => {}}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <span style={{ cursor: "pointer" }}>
                <DeleteTwoTone twoToneColor="#ff4d4f" />
              </span>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<IAdminProfile>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{
          labelWidth: 120,
        }}
        request={async (params, sort, filter) => {
          let query = "";
          if (params) {
            query += `page=${params.current}&pageSize=${params.pageSize}`;
            if (params.full_name) {
              query += `&fullName=${params.full_name}`;
            }
            if (params.phone) {
              query += `&phone=${params.phone}`;
            }
          }
          const res = await getAllAdminsProfile(query);
          if (res.data) {
            setMeta(res.data.meta);
          }
          return {
            data: res.data?.result,
            page: 1,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
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
        headerTitle="Danh sách thông tin admin"
        toolBarRender={() => [
          <Button icon={<ExportOutlined />} type="primary">
            Export
          </Button>,
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenModalCreate(true);
            }}
            type="primary"
          >
            Add new
          </Button>,
        ]}
      />

      {/* <SpecialitesCreate
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        refreshTable={refreshTable}
      /> */}
    </>
  );
};

export default AdminTable;
