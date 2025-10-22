import type { ISpecialtyTable } from "@/types";
import { Drawer, Descriptions, Avatar, Typography, Divider } from "antd";

const { Title, Paragraph } = Typography;

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  dataViewDetail: ISpecialtyTable | null;
  setDataViewDetail: (v: ISpecialtyTable | null) => void;
}

const SpecialitesDetail = (props: IProps) => {
  const {
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
    setDataViewDetail,
  } = props;

  const onClose = () => {
    setOpenViewDetail(false);
    setDataViewDetail(null);
  };

  return (
    <Drawer
      title={<Title level={4}>Chi tiết chuyên khoa</Title>}
      width={"40vw"}
      onClose={onClose}
      open={openViewDetail}
      bodyStyle={{ padding: "24px" }}
    >
      {/* Header hiển thị ảnh + tên */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Avatar
          src={dataViewDetail?.iconPath}
          alt="Ảnh chuyên khoa"
          size={80}
          shape="square"
          style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        />
        <div>
          <Title
            level={5}
            style={{ marginBottom: 0, fontWeight: 700, fontSize: 20 }}
          >
            {dataViewDetail?.specialtyName}
          </Title>
          <span
            style={{ color: "rgba(0,0,0,0.45)", fontSize: 14, fontWeight: 600 }}
          >
            ID: {dataViewDetail?.id}
          </span>
        </div>
      </div>

      <Divider />

      {/* Nội dung chi tiết */}
      <Descriptions
        bordered
        size="small"
        column={1}
        labelStyle={{
          fontWeight: 700,
          width: 160,
          background: "#fafafa",
        }}
        contentStyle={{
          fontSize: 15,
        }}
      >
        <Descriptions.Item label="Tên chuyên khoa">
          {dataViewDetail?.specialtyName}
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả">
          <Paragraph
            ellipsis={{ rows: 5, expandable: true, symbol: "Xem thêm" }}
            style={{ whiteSpace: "pre-line" }}
          >
            {dataViewDetail?.description || "Không có mô tả"}
          </Paragraph>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default SpecialitesDetail;
