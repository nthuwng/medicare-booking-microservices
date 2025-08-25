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
import { getAllClinics } from "../../services/admin.api";
import ClinicCreate from "./ClinicCreate";
import ClinicDetail from "./ClinicDetail";
import type { IClinicTable } from "@/types";

const ClinicTable = () => {
  const actionRef = useRef<ActionType>(null);
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IClinicTable | null>(
    null
  );
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<IClinicTable>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
        return (
          <a
            href="#"
            onClick={() => {
              setDataViewDetail(entity);
              setOpenViewDetail(true);
            }}
          >
            {entity.id}
          </a>
        );
      },
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
      render(dom, entity, index, action, schema) {
        return (
          <img
            src={entity.iconPath}
            alt=""
            className="w-10 h-10 object-cover"
          />
        );
      },
      hideInSearch: true,
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
      render(dom, entity, index, action, schema) {
        return (
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
              onClick={() => {}}
            />

            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa chuyên khoa"}
              description={"Bạn có chắc chắn muốn xóa chuyên khoa này ?"}
              onConfirm={() => {}}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <span style={{ cursor: "pointer" }}>
                <DeleteTwoTone
                  twoToneColor="#ff4d4f"
                  style={{ fontSize: 15 }}
                />
              </span>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <>
      <ProTable<IClinicTable>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          let query = "";
          if (params) {
            query += `current=${params.current}&pageSize=${params.pageSize}`;
          }
          const res = await getAllClinics(query);
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
        headerTitle="Danh sách phòng khám"
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
    </>
  );
};

export default ClinicTable;
