// IntentRenderer.tsx

import { SpecialtyRecommendation } from "./SpecialtyRecommendation";
import { SpecialtyDoctorCheck } from "./SpecialtyDoctorCheck";

type Props = { intent?: string | null; text?: string | null; data?: any };

const intentComponentMap: Record<string, React.FC<any>> = {
  recommend_specialty_text: SpecialtyRecommendation,
  specialty_doctor_check: SpecialtyDoctorCheck,
  recommend_specialty_image: SpecialtyRecommendation,
  // thêm intents khác ở đây
};

export default function IntentRenderer({ intent, text, data }: Props) {
  if (!intent) return null;

  // Render đơn giản cho medical_qa: chỉ hiển thị text, giữ xuống dòng
  if (intent === "medical_qa" || intent === "smalltalk") {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 12,
          whiteSpace: "pre-line",
          lineHeight: 1.6,
          color: "#111827",
          fontSize: 16,
        }}
      >
        {text}
      </div>
    );
  }

  const Component = intentComponentMap[intent];
  if (!Component) return null;
  return <Component text={text ?? null} data={data ?? null} />;
}
