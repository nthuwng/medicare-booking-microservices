import { GoogleGenAI } from "@google/genai";
import { ai, MODEL_AI } from "src/config/gemini";
import {
  promptMedicalQA,
  promptRecommendSpecialtyText,
} from "src/prompts/prompts";
import { checkSpecialtyDoctorViaRabbitMQ } from "src/queue/publishers/ai.publishers";

export type ToolResult = { content?: string; data?: any };

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
    return {
      content:
        "Bạn có thể mô tả rõ hơn về triệu chứng đang gặp phải không? Mình sẽ giúp bạn tìm chuyên khoa phù hợp nhất! 😊",
    };

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
        content:
          "Xin lỗi, mình gặp chút khó khăn khi xử lý thông tin. Bạn có thể mô tả lại triệu chứng một cách rõ ràng hơn không? 😊",
        data: null,
      };
    }
    try {
      parsed = JSON.parse(loose);
    } catch {
      return {
        content:
          "Xin lỗi, mình gặp chút khó khăn khi xử lý thông tin. Bạn có thể mô tả lại triệu chứng một cách rõ ràng hơn không? 😊",
        data: null,
      };
    }
  }

  const name = parsed?.specialty_name || "Nội tổng quát";
  const conf = normalizeConfidence(parsed?.confidence);
  const confPct = Math.round(conf * 100);
  const reasoning = parsed?.reasoning || "Cần thăm khám sàng lọc ban đầu.";

  return {
    content: `Dựa trên triệu chứng bạn mô tả, mình nghĩ bạn nên khám chuyên khoa ${name} nhé!`,
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
    return {
      content:
        "Bạn có câu hỏi gì về sức khỏe cần mình tư vấn không? Mình sẵn sàng giúp đỡ bạn! 😊",
    };
  const sys = promptMedicalQA();
  const prompt = `Câu hỏi: ${question}`;
  const resp = await ai.models.generateContent({
    model: MODEL_AI,
    contents: [{ text: sys }, { text: prompt }],
  });
  const text =
    (resp as any)?.response?.text?.() ??
    (resp as any)?.text ??
    "Xin lỗi, mình chưa có thông tin đầy đủ để trả lời câu hỏi này. Bạn có thể hỏi cụ thể hơn hoặc tham khảo ý kiến bác sĩ trực tiếp nhé! 😊";
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
      message:
        "Hiện tại chưa có bác sĩ nào thuộc chuyên khoa này trong hệ thống. Bạn có thể thử tìm kiếm chuyên khoa khác hoặc liên hệ trực tiếp với phòng khám nhé! 😊",
      data: [],
    };
  }
  return {
    success: true,
    length: resp.length,
    message: `Tuyệt vời! Mình đã tìm thấy ${resp.length} bác sĩ chuyên khoa phù hợp cho bạn. Dưới đây là danh sách các bác sĩ có kinh nghiệm và uy tín! 👨‍⚕️👩‍⚕️`,
    data: resp,
  };
};

export {
  handleRecommendSpecialtyText,
  handleRecommendSpecialtyFromImage,
  handleMedicalQA,
  handleSpecialtyDoctorCheck,
};
