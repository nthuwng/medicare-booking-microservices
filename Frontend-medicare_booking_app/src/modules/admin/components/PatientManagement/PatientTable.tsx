import { useRef, useState } from "react";
import { Popconfirm, Button, Tag } from "antd";
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
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { getAllPatientsProfile } from "../../services/admin.api";
import type { IPatientProfile } from "@/types";
import PatientDetail from "./PatientDetail";

const PatientTable = () => {
  const actionRef = useRef<ActionType>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IPatientProfile | null>(
    null
  );
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const columns: ProColumns<IPatientProfile>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render(_, entity) {
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
      title: "Giới tính",
      dataIndex: "gender",
      hideInSearch: true,
      render(_, entity) {
        return entity.gender === "Male" ? (
          <Tag color="blue">Nam</Tag>
        ) : (
          <Tag color="pink">Nữ</Tag>
        );
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "date_of_birth",
      hideInSearch: true,
      render(_, entity) {
        return dayjs(entity.date_of_birth).format("DD/MM/YYYY");
      },
    },

    {
      title: "Action",
      hideInSearch: true,
      render(_, entity) {
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
      <ProTable<IPatientProfile>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
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
          const res = await getAllPatientsProfile(query);
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
        headerTitle="Danh sách thông tin bệnh nhân"
        toolBarRender={() => [
          <Button icon={<ExportOutlined />} type="primary">
            Export
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

      <PatientDetail
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />
      {/* <SpecialitesCreate
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        refreshTable={refreshTable}
      /> */}
    </>
  );
};

export default PatientTable;
