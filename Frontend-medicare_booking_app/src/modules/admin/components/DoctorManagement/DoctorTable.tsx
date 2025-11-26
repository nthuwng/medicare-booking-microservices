import { useRef, useState } from "react";
import { Button, Tag, Select, App } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { ExportOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  getAllDoctorsProfile,
  approveDoctorByAdmin,
} from "../../services/admin.api";
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { message } = App.useApp();

  const handleUpdateStatus = async (doctorId: string, status: string) => {
    try {
      setUpdatingId(doctorId);
      await approveDoctorByAdmin(doctorId, status);

      message.success(
        status === "Approved"
          ? "Duyệt bác sĩ thành công!"
          : status === "Rejected"
          ? "Từ chối bác sĩ thành công!"
          : "Chuyển về chờ duyệt thành công!"
      );

      // Reload lại data bảng (không F5 trang, chỉ call lại API)
      actionRef.current?.reload();
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

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
      title: "Tên bác sĩ",
      dataIndex: "fullName",
      ellipsis: true,
      copyable: true,
      width: 200,
      fieldProps: {
        placeholder: "Nhập tên bác sĩ",
      },
    },
    {
      title: "Chức vụ",
      dataIndex: "title",
      valueType: "select",
      width: 150,
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
        allowClear: true,
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 150,
      copyable: true,
      fieldProps: {
        placeholder: "Nhập số điện thoại",
      },
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      hideInSearch: true,
      width: 100,
      align: "center",
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
      width: 150,
      valueType: "select",
      valueEnum: {
        Approved: { text: "Đã duyệt", status: "Success" },
        Rejected: { text: "Từ chối", status: "Error" },
        Pending: { text: "Chờ duyệt", status: "Warning" },
      },
      render(_, entity) {
        const statusConfig = {
          Approved: { color: "success", text: "Đã duyệt" },
          Rejected: { color: "error", text: "Từ chối" },
          Pending: { color: "warning", text: "Chờ duyệt" },
        };
        const config =
          statusConfig[entity.approvalStatus as keyof typeof statusConfig];
        return config ? <Tag color={config.color}>{config.text}</Tag> : null;
      },
      fieldProps: {
        placeholder: "Chọn trạng thái",
        allowClear: true,
      },
    },
    {
      title: "Hành động",
      key: "action",
      hideInSearch: true,
      width: 240,
      align: "center",
      fixed: "right",
      render: (_, entity) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="middle"
            onClick={() => {
              setDataViewDetail(entity);
              setOpenViewDetail(true);
            }}
          >
            Xem
          </Button>
          <Select
            size="middle"
            style={{ width: 140 }}
            value={entity.approvalStatus}
            loading={updatingId === entity.id}
            disabled={updatingId === entity.id}
            onChange={(value) => handleUpdateStatus(entity.id, value)}
            options={[
              {
                value: "Approved",
                label: "✓ Đã duyệt",
              },
              {
                value: "Rejected",
                label: "✗ Từ chối",
              },
              {
                value: "Pending",
                label: "⏱ Chờ duyệt",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <ProTable<IDoctorProfile>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{
          labelWidth: "auto",
          span: {
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            xl: 6,
            xxl: 6,
          },
          collapsed: false,
          collapseRender: false,
          searchText: "Tìm kiếm",
          resetText: "Làm lại",
          className: "custom-search-form",
        }}
        form={{
          syncToUrl: false,
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
            if (params.approvalStatus) {
              query += `&approvalStatus=${params.approvalStatus}`;
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
        headerTitle="Danh sách thông tin doctors "
        toolBarRender={() => [
          <Button icon={<ExportOutlined />} type="primary">
            Export
          </Button>
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
