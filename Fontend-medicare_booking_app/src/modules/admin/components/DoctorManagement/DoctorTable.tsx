import { useRef, useState } from "react";
import { Popconfirm, Button, App } from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import type { ActionType, ProColumns } from "@ant-design/pro-components";

const DoctorTable = () => {
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<any>[] = [
    {
      title: "Id",
      dataIndex: "_id",
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
            {entity._id}
          </a>
        );
      },
    },
    {
      title: "Tên sách",
      dataIndex: "mainText",
      sorter: true,
    },
    {
      title: "Thể loại",
      dataIndex: "category",
      hideInSearch: true,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      sorter: true,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      hideInSearch: true,
      sorter: true,
      // https://stackoverflow.com/questions/37985642/vnd-currency-formatting
      render(dom, entity, index, action, schema) {
        return (
          <>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(entity.price)}
          </>
        );
      },
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      sorter: true,
      valueType: "date",
      hideInSearch: true,
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
              title={"Xác nhận xóa book"}
              description={"Bạn có chắc chắn muốn xóa book này ?"}
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
      <ProTable<any, any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          const res = {
            data: {
              result: [],
              meta: {
                current: 1,
                pageSize: 10,
                total: 0,
              },
            },
          };
          return {
            data: res.data?.result,
            page: 1,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="_id"
        pagination={{
          current: 1,
          pageSize: 10,
          showSizeChanger: true,
          total: 0,
          showTotal: (total, range) => {
            return (
              <div>
                {" "}
                {range[0]}-{range[1]} trên {total} rows
              </div>
            );
          },
        }}
        headerTitle="Danh sách bác sĩ"
        toolBarRender={() => [
          <Button icon={<ExportOutlined />} type="primary">
            Export
          </Button>,
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {}}
            type="primary"
          >
            Add new
          </Button>,
        ]}
      />

      {/* <DetailBook
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      /> */}
    </>
  );
};

export default DoctorTable;
