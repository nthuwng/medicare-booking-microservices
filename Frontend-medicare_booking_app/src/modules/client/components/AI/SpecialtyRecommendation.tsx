// SpecialtyRecommendation.tsx
import type { IAiRecommendSpecialty } from "@/types";
import { Card, Tag, Button, Typography, Space } from "antd";
import { useCurrentApp } from "@/components/contexts/app.context";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph, Title } = Typography;

interface Props {
  text: string | null;
  data: IAiRecommendSpecialty | null;
  onFindDoctors?: (specialtyName: string) => void;
}

/* Palette thống nhất với AIPage */
const palette = {
  dark: {
    surface: "#0f1b2d",
    surface2: "#152238",
    border: "rgba(255,255,255,0.10)",
    text: "#ffffff",
    textSoft: "#94a3b8",
    primary: "#60a5fa",
    primarySoft: "rgba(96,165,250,0.15)",
  },
  light: {
    surface: "#ffffff",
    surface2: "#ffffff",
    border: "#e5e7eb",
    text: "#0f172a",
    textSoft: "#6b7280",
    primary: "#1677ff",
    primarySoft: "#eff6ff",
  },
};

const SpecialtyRecommendation = (props: Props) => {
  const { text, data } = props;
  const navigate = useNavigate();
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";
  const C = isDark ? palette.dark : palette.light;

  const confidencePct = Math.round((data?.confidence ?? 0) * 100);

  return (
    <Card
      size="small"
      bordered
      className="mb-2"
      bodyStyle={{ padding: 16 }}
      style={{
        background: C.surface,
        borderColor: C.border,
        boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
      }}
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
          <Title level={5} style={{ margin: 0, fontSize: 17, color: C.text }}>
            {text}
          </Title>
          <Tag
            style={{
              marginLeft: "auto",
              fontSize: 12,
              background: isDark ? C.primarySoft : "#e6f4ff",
              color: isDark ? C.primary : "#1677ff",
              borderColor: isDark ? C.border : "#91caff",
            }}
          >
            Độ tin cậy: {confidencePct}%
          </Tag>
        </div>

        {data?.reasoning && (
          <Paragraph style={{ margin: 0, color: C.textSoft, fontSize: 16 }}>
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
          <Text style={{ color: C.text }}>
            <span style={{ color: C.textSoft, fontSize: 16 }}>
              Chuyên khoa:
            </span>
            <span
              style={{
                fontWeight: 600,
                marginLeft: 6,
                fontSize: 16,
                color: C.text,
              }}
            >
              {data?.specialty_name}
            </span>
          </Text>
        </div>

        <div>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/booking-options/specialty`)}
            style={{
              background: isDark ? C.primary : undefined,
            }}
          >
            Tìm bác sĩ
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export { SpecialtyRecommendation };
