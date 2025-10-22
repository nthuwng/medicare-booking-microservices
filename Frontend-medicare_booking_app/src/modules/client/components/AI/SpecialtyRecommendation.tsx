import type { IAiRecommendSpecialty } from "@/types";
import { Card, Tag, Button, Typography, Space } from "antd";

const { Text, Paragraph, Title } = Typography;

interface Props {
  text: string | null;
  data: IAiRecommendSpecialty | null;
  onFindDoctors?: (specialtyName: string) => void;
}

const SpecialtyRecommendation = (props: Props) => {
  const { text, data, onFindDoctors } = props;

  const confidencePct = Math.round((data?.confidence ?? 0) * 100);

  return (
    <Card
      size="small"
      bordered
      className="mb-2"
      bodyStyle={{ padding: 16 }}
      style={{ background: "#fff" }}
    >
      <Space direction="vertical" style={{ width: "100%", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "space-between",
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: 17 }}>
            {text}
          </Title>
          <Tag color="blue" style={{ marginLeft: "auto", fontSize: 12 }}>
            Độ tin cậy : {confidencePct}%
          </Tag>
        </div>

        {data?.reasoning && (
          <Paragraph style={{ margin: 0, color: "#6b7280", fontSize: 16 }}>
            {data.reasoning}
          </Paragraph>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Text>
            <span style={{ color: "#6b7280", fontSize: 16 }}>Chuyên khoa:</span>
            <span style={{ fontWeight: 600, marginLeft: 6, fontSize: 16 }}>
              {data?.specialty_name}
            </span>
          </Text>
        </div>

        <div>
          <Button
            type="primary"
            size="small"
            onClick={() => onFindDoctors?.(data?.specialty_name ?? "")}
          >
            Tìm bác sĩ
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export { SpecialtyRecommendation };
