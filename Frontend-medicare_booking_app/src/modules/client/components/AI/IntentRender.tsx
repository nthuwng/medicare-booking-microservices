// src/components/AI/IntentRender/IntentRenderer.tsx

import { useCurrentApp } from "@/components/contexts/app.context";
import { SpecialtyRecommendation } from "./SpecialtyRecommendation";
import { SpecialtyDoctorCheck } from "./SpecialtyDoctorCheck";

type Props = { intent?: string | null; text?: string | null; data?: any };

const intentComponentMap: Record<string, React.FC<any>> = {
  recommend_specialty_text: SpecialtyRecommendation,
  specialty_doctor_check: SpecialtyDoctorCheck,
  recommend_specialty_image: SpecialtyRecommendation,
  // thêm intents khác ở đây
};

/** Palette khớp AboutPage/AIPage */
const palette = {
  dark: {
    surface: "#0f1b2d",
    surface2: "#152238",
    border: "rgba(255,255,255,0.10)",
    text: "#ffffff",
    textMuted: "#cbd5e1",
  },
  light: {
    surface: "#ffffff",
    surface2: "#ffffff",
    border: "#e5e7eb",
    text: "#0f172a",
    textMuted: "#475569",
  },
};

export default function IntentRenderer({ intent, text, data }: Props) {
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";
  const C = isDark ? palette.dark : palette.light;

  if (!intent) return null;

  // Các intent hiển thị text thường (giữ xuống dòng)
  if (intent === "medical_qa" || intent === "smalltalk" || intent === "other") {
    return (
      <div
        style={{
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 12,
          whiteSpace: "pre-line",
          lineHeight: 1.65,
          color: "inherit",
          fontSize: 15.5,
          boxShadow: isDark ? "" : "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {text}
      </div>
    );
  }

  // Các intent có component riêng
  const Component = intentComponentMap[intent];
  if (!Component) return null;

  // Bọc một lớp card nhẹ để đồng bộ UI (không ảnh hưởng logic)
  return (
    <div
      style={{
        background: "transparent",
        border: "none",
        borderRadius: 12,
        padding: 12,
        color: C.text,
        boxShadow: isDark ? "" : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Component text={text ?? null} data={data ?? null} />
    </div>
  );
}
