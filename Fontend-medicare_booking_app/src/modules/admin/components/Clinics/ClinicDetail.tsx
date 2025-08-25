import type { IClinicTable } from "@/types";
import { Drawer, Card, Avatar, Typography, Space, Tag, Row, Col } from "antd";
import {
  BankOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PictureOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  dataViewDetail: IClinicTable | null;
  setDataViewDetail: (v: IClinicTable | null) => void;
}

const ClinicDetail = (props: IProps) => {
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
      title={
        <Space align="center" style={{ fontSize: 18, fontWeight: "bold" }}>
          <BankOutlined style={{ color: "#1890ff" }} />
          Chi tiết phòng khám
        </Space>
      }
      width={600}
      onClose={onClose}
      open={openViewDetail}
      styles={{
        body: {
          padding: "24px",
          backgroundColor: "#fafafa",
        },
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "16px",
        },
      }}
    >
      {dataViewDetail && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Card với Avatar và Tên */}
          <Card
            style={{
              borderRadius: "12px",
              border: "1px solid #e8f4f8",
              background: "linear-gradient(135deg, #f8fcff 0%, #e8f4f8 100%)",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={80}
                src={dataViewDetail.iconPath}
                style={{
                  marginBottom: "16px",
                  border: "3px solid #fff",
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                }}
                icon={<PictureOutlined />}
              />
              <Title
                level={3}
                style={{ margin: "0 0 8px 0", color: "#1890ff" }}
              >
                {dataViewDetail.clinicName}
              </Title>
              <Tag
                icon={<IdcardOutlined />}
                color="blue"
                style={{ fontSize: "12px" }}
              >
                ID: {dataViewDetail.id}
              </Tag>
            </div>
          </Card>

          {/* Thông tin liên hệ */}
          <Card
            title={
              <Space>
                <PhoneOutlined style={{ color: "#52c41a" }} />
                <Text strong style={{ color: "#52c41a" }}>
                  Thông tin liên hệ
                </Text>
              </Space>
            }
            style={{
              borderRadius: "12px",
              border: "1px solid #e8f5e8",
            }}
            styles={{
              header: {
                backgroundColor: "#f6ffed",
                borderRadius: "12px 12px 0 0",
              },
              body: { padding: "20px" },
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space direction="vertical" size={0} style={{ width: "100%" }}>
                  <Text type="secondary">Số điện thoại</Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "6px",
                      marginTop: "4px",
                    }}
                  >
                    <PhoneOutlined
                      style={{ color: "#52c41a", marginRight: "8px" }}
                    />
                    <Text strong style={{ fontSize: "16px" }}>
                      {dataViewDetail.phone}
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Địa chỉ */}
          <Card
            title={
              <Space>
                <EnvironmentOutlined style={{ color: "#fa8c16" }} />
                <Text strong style={{ color: "#fa8c16" }}>
                  Địa chỉ phòng khám
                </Text>
              </Space>
            }
            style={{
              borderRadius: "12px",
              border: "1px solid #fff1f0",
            }}
            styles={{
              header: {
                backgroundColor: "#fff2e8",
                borderRadius: "12px 12px 0 0",
              },
              body: { padding: "20px" },
            }}
          >
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Text type="secondary">Địa chỉ đầy đủ</Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "12px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "6px",
                  marginTop: "4px",
                }}
              >
                <EnvironmentOutlined
                  style={{
                    color: "#fa8c16",
                    marginRight: "8px",
                    marginTop: "2px",
                  }}
                />
                <Text strong style={{ fontSize: "15px", lineHeight: "1.5" }}>
                  {dataViewDetail.street}, {dataViewDetail.district},{" "}
                  {dataViewDetail.city}
                </Text>
              </div>
            </Space>
          </Card>

          {/* Mô tả */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: "#722ed1" }} />
                <Text strong style={{ color: "#722ed1" }}>
                  Mô tả phòng khám
                </Text>
              </Space>
            }
            style={{
              borderRadius: "12px",
              border: "1px solid #f9f0ff",
            }}
            styles={{
              header: {
                backgroundColor: "#f9f0ff",
                borderRadius: "12px 12px 0 0",
              },
              body: { padding: "20px" },
            }}
          >
            <Paragraph
              style={{
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
                padding: "12px",
                backgroundColor: "#f9f9f9",
                borderRadius: "6px",
                borderLeft: "4px solid #722ed1",
              }}
            >
              {dataViewDetail.description || "Chưa có mô tả"}
            </Paragraph>
          </Card>
        </div>
      )}
    </Drawer>
  );
};

export default ClinicDetail;
