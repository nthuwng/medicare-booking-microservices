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
import {
  getAllAdminsProfile,
  getAllPatientsProfile,
} from "../../services/admin.api";
import type { IAdminProfile, IPatientProfile } from "../../types";

const PatientTable = () => {
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

  const columns: ProColumns<IPatientProfile>[] = [
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
      title: "Giới tính",
      dataIndex: "gender",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
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
      render(dom, entity, index, action, schema) {
        return dayjs(entity.date_of_birth).format("DD/MM/YYYY");
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
      <ProTable<IPatientProfile>
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
          const res = await getAllPatientsProfile(query);
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
        headerTitle="Danh sách thông tin bệnh nhân"
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

export default PatientTable;
