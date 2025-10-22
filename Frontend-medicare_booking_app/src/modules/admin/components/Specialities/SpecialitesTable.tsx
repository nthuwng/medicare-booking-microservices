import { useRef, useState } from "react";
import { Popconfirm, Button, App, notification } from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { deleteSpecialites, getAllSpecialties } from "../../services/admin.api";
import SpecialitesCreate from "./SpecialitesCreate";
import type { ISpecialtyTable } from "@/types";
import SpecialitesDetail from "./SpecialitesDetail";
import SpecialitesUpdate from "./SpecialitesUpdate";

const SpecialitesTable = () => {
  const actionRef = useRef<ActionType>(null);

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);

  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [dataViewDetail, setDataViewDetail] = useState<ISpecialtyTable | null>(
    null
  );
  const [dataUpdate, setDataUpdate] = useState<ISpecialtyTable | null>(null);

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const { message } = App.useApp();

  const refreshTable = () => actionRef.current?.reload();

  const handleDelete = async (record: ISpecialtyTable) => {
    try {
      const res = await deleteSpecialites(record.id);
      // BE xoá thường trả 200 hoặc 204
      if (res.success === true) {
        message.success("Xoá chuyên khoa thành công");
        actionRef.current?.reload();
        return;
      }
      notification.error({
        message: "Không thể xoá chuyên khoa",
        description: (res as any)?.data?.message || "Đã có lỗi xảy ra",
      });
    } catch (e: any) {
      notification.error({
        message: "Không thể xoá chuyên khoa",
        description:
          e?.response?.data?.message || e?.message || "Đã có lỗi xảy ra",
      });
    }
  };

  const columns: ProColumns<ISpecialtyTable>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render: (_, entity) => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDataViewDetail(entity);
            setOpenViewDetail(true);
          }}
        >
          {entity.id}
        </a>
      ),
    },
    {
      title: "Tên chuyên khoa",
      dataIndex: "specialtyName",
      hideInSearch: true,
    },
    {
      title: "Tìm kiếm chuyên khoa",
      dataIndex: "specialtyName",
      hideInTable: true,
      fieldProps: {
        placeholder: "Nhập tên chuyên khoa để tìm kiếm",
        style: { width: 280 },
      },
    },
    {
      title: "Hình ảnh",
      dataIndex: "iconPath",
      hideInSearch: true,
      render: (_, entity) => (
        <img
          src={entity.iconPath}
          alt=""
          className="w-10 h-10 object-cover rounded"
        />
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      hideInSearch: true,
      render: (_, record) => (
        <div
          style={{
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={record.description}
        >
          {record.description}
        </div>
      ),
    },
    {
      title: "Action",
      hideInSearch: true,
      width: 140,
      render: (_, entity) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <EyeOutlined
            style={{ cursor: "pointer", color: "#1890ff", fontSize: 16 }}
            onClick={(e) => {
              e.stopPropagation();
              setDataViewDetail(entity);
              setOpenViewDetail(true);
            }}
          />

          <EditTwoTone
            twoToneColor="#f57800"
            style={{ cursor: "pointer", fontSize: 16 }}
            onClick={(e) => {
              e.stopPropagation();
              setDataUpdate(entity);
              setOpenModalUpdate(true);
            }}
          />

          <Popconfirm
            placement="leftTop"
            title="Xác nhận xoá chuyên khoa"
            description="Bạn có chắc chắn muốn xoá chuyên khoa này?"
            onConfirm={(e) => {
              e?.stopPropagation?.();
              return handleDelete(entity);
            }}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <DeleteTwoTone
              twoToneColor="#ff4d4f"
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <ProTable<ISpecialtyTable>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{ labelWidth: 150 }}
        request={async (params) => {
          let query = "";
          if (params) {
            query += `page=${params.current}&pageSize=${params.pageSize}`;
            if (params.specialtyName)
              query += `&specialtyName=${params.specialtyName}`;
          }
          console.log("query", query);
          const res = await getAllSpecialties(query);
          if (res?.data?.meta) setMeta(res.data.meta);
          console.log("meta", meta);
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
          showTotal: (total, range) => (
            <div>
              {range[0]}-{range[1]} trên {total} rows
            </div>
          ),
        }}
        headerTitle="Danh sách chuyên khoa"
        toolBarRender={() => [
          <Button key="export" icon={<ExportOutlined />} type="primary">
            Export
          </Button>,
          <Button
            key="create"
            icon={<PlusOutlined />}
            onClick={() => setOpenModalCreate(true)}
            type="primary"
          >
            Add new
          </Button>,
        ]}
      />

      {/* Create */}
      <SpecialitesCreate
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        refreshTable={refreshTable}
      />

      {/* Detail */}
      <SpecialitesDetail
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <SpecialitesUpdate
        openModalUpdate={openModalUpdate}
        setOpenModalUpdate={setOpenModalUpdate}
        refreshTable={refreshTable}
        dataSpecialty={
          dataUpdate
            ? {
                id: dataUpdate.id,
                specialtyName: dataUpdate.specialtyName,
                iconPath: dataUpdate.iconPath,
                description: dataUpdate.description,
              }
            : null
        }
      />
    </>
  );
};

export default SpecialitesTable;
