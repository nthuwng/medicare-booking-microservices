import { GoogleGenAI } from "@google/genai";
import {
  promptMedicalQA,
  promptRecommendSpecialtyText,
} from "src/prompts/prompts";
import { checkSpecialtyDoctorViaRabbitMQ } from "src/queue/publishers/ai.publishers";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL_AI = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash";

export type ToolResult = { content?: string; data?: any };

const RULES: Array<{ kw: RegExp; name: string; why: string }> = [
  {
    kw: /ngứa|dị ứng|mẩn đỏ|phát ban/i,
    name: "Da liễu",
    why: "Triệu chứng da liễu (ngứa/mẩn đỏ/phát ban)",
  },
  {
    kw: /đau bụng|tiêu chảy|buồn nôn|nôn/i,
    name: "Tiêu hoá",
    why: "Triệu chứng đường tiêu hoá",
  },
  {
    kw: /ho|khó thở|đau ngực|hen/i,
    name: "Hô hấp",
    why: "Triệu chứng đường hô hấp",
  },
  {
    kw: /đau đầu|chóng mặt|tê/i,
    name: "Thần kinh",
    why: "Triệu chứng thần kinh (đau đầu/tê/chóng mặt)",
  },
  {
    kw: /đau khớp|sưng khớp|đau lưng/i,
    name: "Cơ xương khớp",
    why: "Triệu chứng cơ xương khớp",
  },
];

// --- Helpers “ăn chắc” ---
function extractJsonLoose(s: string): string | null {
  // bỏ code fence nếu có
  s = s.replace(/```json|```/g, "").trim();
  // lấy block JSON lớn nhất
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

function normalizeConfidence(v: unknown): number {
  if (typeof v === "string") {
    const n = parseFloat(v.replace("%", "").trim());
    if (isFinite(n))
      return n > 1 ? Math.min(n / 100, 1) : Math.max(Math.min(n, 1), 0);
    return 0.6;
  }
  if (typeof v === "number") {
    if (v > 1) return Math.min(v / 100, 1);
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
  }
  return 0.6;
}

// --- Main ---
const handleRecommendSpecialtyText = async (
  prompt: string
): Promise<ToolResult> => {
  if (!prompt?.trim())
    return { content: "Bạn mô tả rõ triệu chứng giúp mình nhé." };

  // 1) Rule nhanh
  const r = RULES.find((rule) => rule.kw.test(prompt));
  if (r) {
    const conf = 0.8;
    return {
      content: `Chuyên khoa phù hợp: ${r.name}. Độ tin cậy ~ ${Math.round(
        conf * 100
      )}%. Lý do: ${r.why}.`,
      data: { specialty_name: r.name, confidence: conf, reasoning: r.why },
    };
  }

  // 2) LLM (ép JSON thuần)
  const promptText = promptRecommendSpecialtyText(prompt);

  const resp = await ai.models.generateContent({
    model: MODEL_AI,
    contents: [{ text: promptText }],
  });

  // lấy text ra an toàn từ SDK
  const raw =
    (resp as any)?.response?.text?.() ??
    (resp as any)?.text ??
    ((resp as any)?.response?.candidates?.[0]?.content?.parts?.[0] as any)
      ?.text ??
    "{}";

  let jsonStr = String(raw);
  let parsed: any;

  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // fallback: tự cắt lấy JSON trong chuỗi
    const loose = extractJsonLoose(jsonStr);
    if (!loose) {
      return {
        content: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.",
        data: null,
      };
    }
    try {
      parsed = JSON.parse(loose);
    } catch {
      return {
        content: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.",
        data: null,
      };
    }
  }

  const name = parsed?.specialty_name || "Nội tổng quát";
  const conf = normalizeConfidence(parsed?.confidence);
  const confPct = Math.round(conf * 100);
  const reasoning = parsed?.reasoning || "Cần thăm khám sàng lọc ban đầu.";

  return {
    content: `Chuyên khoa phù hợp: ${name}. Độ tin cậy ~ ${confPct}%. Lý do: ${reasoning}`,
    data: { specialty_name: name, confidence: conf, reasoning },
  };
};

const handleRecommendSpecialtyFromImage = async (
  systemInstruction: string,
  model: string,
  userPrompt: string,
  file: any,
  base64: string
) => {
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        text: `${systemInstruction}\n\n${userPrompt}`,
      },
      { inlineData: { mimeType: file.mimetype, data: base64 } },
    ],
  });

  let text = response.text || "";

  text = text.replace(/```json|```/g, "").trim();

  return text;
};

const handleMedicalQA = async (question: string): Promise<ToolResult> => {
  if (!question?.trim())
    return { content: "Bạn hãy nhập câu hỏi y tế cần tư vấn." };
  const sys = promptMedicalQA();
  const prompt = `Câu hỏi: ${question}`;
  const resp = await ai.models.generateContent({
    model: MODEL_AI,
    contents: [{ text: sys }, { text: prompt }],
  });
  const text =
    (resp as any)?.response?.text?.() ??
    (resp as any)?.text ??
    "Xin lỗi, tôi chưa có câu trả lời phù hợp.";
  return {
    content: String(text)
      .replace(/```/g, "")
      .replace(/[*•\-]+/g, "")
      .replace(/#+/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim(),
  };
};

const handleSpecialtyDoctorCheck = async (specialtyName: string) => {
  const resp = await checkSpecialtyDoctorViaRabbitMQ(specialtyName);

  if (!resp || resp.length === 0) {
    return {
      success: false,
      length: 0,
      message: "Không có bác sĩ nào thuộc chuyên khoa này",
      data: [],
    };
  }
  return {
    success: true,
    length: resp.length,
    message: "Kiểm tra thông tin bác sĩ thuộc chuyên khoa này thành công.",
    data: resp,
  };
};

export {
  handleRecommendSpecialtyText,
  handleRecommendSpecialtyFromImage,
  handleMedicalQA,
  handleSpecialtyDoctorCheck,
};
