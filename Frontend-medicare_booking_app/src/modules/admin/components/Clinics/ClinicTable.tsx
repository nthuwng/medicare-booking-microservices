import { useRef, useState } from "react";
import { Popconfirm, Button, App } from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { deleteClinics, getAllClinics } from "../../services/admin.api";
import ClinicCreate from "./ClinicCreate";
import ClinicDetail from "./ClinicDetail";
import ClinicUpdate from "./ClinicUpdate";
import type { IClinicTable } from "@/types";

const ClinicTable = () => {
  const actionRef = useRef<ActionType>(null);
  const { message, notification } = App.useApp();

  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

  const [dataViewDetail, setDataViewDetail] = useState<IClinicTable | null>(
    null
  );
  const [dataUpdate, setDataUpdate] = useState<IClinicTable | null>(null);

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const handleDelete = async (record: IClinicTable) => {
    try {
      const res = await deleteClinics(record.id);
      if (res.success === true) {
        message.success(res.message);
        refreshTable();
      } else {
        notification.error({
          message: "Không thể xoá phòng khám",
          description: res?.message || "Đã có lỗi xảy ra",
        });
      }
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description: e?.message || "Có lỗi khi xoá phòng khám",
      });
    }
  };

  const columns: ProColumns<IClinicTable>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render: (_, entity) => (
        <a
          href="#"
          onClick={() => {
            setDataViewDetail(entity);
            setOpenViewDetail(true);
          }}
        >
          {entity.id}
        </a>
      ),
    },
    {
      title: "Tên phòng khám",
      dataIndex: "clinicName",
      hideInSearch: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      hideInSearch: true,
      render: (_, record) => {
        const { street, district, city } = record;
        return `${street}, ${district}, ${city}`;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      hideInSearch: true,
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
      ellipsis: true,
    },
    {
      title: "Action",
      hideInSearch: true,
      width: 140,
      render: (_, entity) => (
        <>
          <EyeOutlined
            style={{
              cursor: "pointer",
              marginRight: 10,
              color: "#1890ff",
              fontSize: 15,
            }}
            onClick={() => {
              setDataViewDetail(entity);
              setOpenViewDetail(true);
            }}
          />
          <EditTwoTone
            twoToneColor="#f57800"
            style={{ cursor: "pointer", marginRight: 10, fontSize: 15 }}
            onClick={() => {
              setDataUpdate(entity);
              setOpenModalUpdate(true);
            }}
          />
          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xoá phòng khám"}
            description={"Bạn có chắc chắn muốn xoá phòng khám này?"}
            onConfirm={() => handleDelete(entity)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <span style={{ cursor: "pointer" }}>
              <DeleteTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 15 }} />
            </span>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <ProTable<IClinicTable>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          let query = "";
          if (params) {
            const page = params.current || 1;
            const pageSize = params.pageSize || 5;
            query += `page=${page}&pageSize=${pageSize}`;
          }
          const res = await getAllClinics(query);
          if (res?.data?.meta) setMeta(res.data.meta);

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
        headerTitle="Danh sách phòng khám"
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

      <ClinicCreate
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        refreshTable={refreshTable}
      />

      <ClinicDetail
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <ClinicUpdate
        openModalUpdate={openModalUpdate}
        setOpenModalUpdate={setOpenModalUpdate}
        refreshTable={refreshTable}
        dataClinic={
          dataUpdate
            ? {
                id: dataUpdate.id,
                clinic_name: dataUpdate.clinicName,
                city: dataUpdate.city,
                district: dataUpdate.district,
                street: dataUpdate.street,
                phone: dataUpdate.phone,
                description: dataUpdate.description,
                icon_path: dataUpdate.iconPath,
                icon_public_id: dataUpdate.iconPublicId,
              }
            : null
        }
      />
    </>
  );
};

export default ClinicTable;
