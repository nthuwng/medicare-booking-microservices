import { useRef, useState } from "react";
import { Popconfirm, Button } from "antd";
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
import { getAllTimeSlotsAdmin } from "../../services/admin.api";
import type { ITimeSlotDetail } from "@/types";

const TimeslotTable = () => {
  const actionRef = useRef<ActionType>(null);
  const [meta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  });

  const columns: ProColumns<ITimeSlotDetail>[] = [
    {
      title: "Id",
      dataIndex: "id",
      hideInSearch: true,
      render(_, entity) {
        return <a href="#">{entity.id}</a>;
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      hideInSearch: true,
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      hideInSearch: true,
    },
  ];

  return (
    <>
      <ProTable<ITimeSlotDetail>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        search={{
          labelWidth: 120,
        }}
        request={async () => {
          const res = await getAllTimeSlotsAdmin();
          return {
            data: res.data || [],
            success: true,
            total: res.data?.length || 0,
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
        headerTitle="Danh sách thời gian"
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
    </>
  );
};

export default TimeslotTable;
