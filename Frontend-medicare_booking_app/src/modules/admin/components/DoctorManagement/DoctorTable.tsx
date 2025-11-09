import { useEffect, useRef, useState } from "react";
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
import { getAllDoctorsProfile } from "../../services/admin.api";
import type { IDoctorProfile } from "@/types";
import DoctorDetail from "./DoctorDetail";

const DoctorTable = () => {
  const actionRef = useRef<ActionType>(null);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  });

  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IDoctorProfile | null>(
    null
  );

  useEffect(() => {
    console.log("meta", meta);
  }, [meta]);

  const columns: ProColumns<IDoctorProfile>[] = [
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
      width: 200,
      ellipsis: true,
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      ellipsis: true,
      width: 200,
      fieldProps: {
        placeholder: "Nhập tên để tìm kiếm",
        style: {
          width: "180px",
        },
      },
    },
    {
      title: "Chức vụ",
      dataIndex: "title",
      valueType: "select",
      valueEnum: {
        BS: { text: "Bác sĩ" },
        ThS: { text: "Thạc sĩ" },
        TS: { text: "Tiến sĩ" },
        PGS: { text: "Phó Giáo sư" },
        GS: { text: "Giáo sư" },
      },
      render(_, entity) {
        return entity.title === "BS" ? (
          <Tag color="blue">Bác sĩ</Tag>
        ) : entity.title === "ThS" ? (
          <Tag color="green">Thạc sĩ</Tag>
        ) : entity.title === "TS" ? (
          <Tag color="purple">Tiến sĩ</Tag>
        ) : entity.title === "PGS" ? (
          <Tag color="orange">Phó Giáo Sư</Tag>
        ) : (
          <Tag color="red">Giáo Sư</Tag>
        );
      },
      fieldProps: {
        placeholder: "Chọn chức vụ",
        style: { width: "150px" },
      },
    },
    {
      title: "Số điện thoại:",
      dataIndex: "phone",
      fieldProps: {
        placeholder: "Nhập số điện thoại để tìm kiếm",
        style: {
          width: "240px",
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
      title: "Trạng thái",
      dataIndex: "approvalStatus",
      hideInSearch: true,
    },
  ];

  return (
    <>
      <ProTable<IDoctorProfile>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{
          labelWidth: 0,
          span: 6,
          collapsed: false,
          collapseRender: false,
        }}
        request={async (params) => {
          let query = "";
          if (params) {
            query += `page=${params.current}&pageSize=${params.pageSize}`;
            if (params.fullName) {
              query += `&fullName=${params.fullName}`;
            }
            if (params.phone) {
              query += `&phone=${params.phone}`;
            }
            if (params.title) {
              query += `&title=${params.title}`;
            }
          }
          const res = await getAllDoctorsProfile(query);
          const payload = res?.data;
          const metaApi = payload?.meta;

          if (metaApi) {
            setMeta({
              current: metaApi.current,
              pageSize: metaApi.pageSize,
              pages: metaApi.pages,
              total: metaApi.total,
            });
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
        headerTitle="Danh sách thông tin admin"
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

      <DoctorDetail
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

export default DoctorTable;
