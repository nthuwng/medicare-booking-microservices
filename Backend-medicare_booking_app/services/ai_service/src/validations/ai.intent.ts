// src/services/ai.intent.ts
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { intentPrompt } from "src/prompts/intent.prompts";
import { ai, MODEL_AI } from "src/config/gemini";

export const IntentSchema = z.object({
  intent: z.enum([
    "smalltalk",
    "recommend_specialty_image",
    "recommend_specialty_text",
    "medical_qa",
    "specialty_doctor_check",
    "other",
  ]),
  args: z.object({
    symptoms: z.string().nullable().optional(),
    specialty: z.string().nullable().optional(),
  }),
});

export type ParsedIntent = z.infer<typeof IntentSchema>;

// Gom mọi biến thể (text / symptom / info.symptom / args.symptoms) về args.symptoms
function normalizeParsed(raw: any, originalMessage: string): ParsedIntent {
  const intent:
    | "smalltalk"
    | "recommend_specialty_text"
    | "recommend_specialty_image"
    | "medical_qa"
    | "specialty_doctor_check"
    | "other" = raw?.intent ?? "other";

  const symptomsCandidate =
    raw?.args?.symptoms ??
    raw?.symptoms ??
    raw?.symptom ??
    raw?.text ??
    raw?.info?.symptom ??
    raw?.info?.symptoms ??
    null;

  // Nếu là recommend_specialty_text mà chưa có symptoms, fallback = originalMessage
  const symptoms =
    symptomsCandidate ??
    (intent === "recommend_specialty_text" ? originalMessage : null);

  return { intent, args: { symptoms } };
}

// Nhận diện entity cơ bản (tên thuốc, triệu chứng, ngày tháng) bằng regex đơn giản
function extractEntities(text: string) {
  const drugs = [];
  const drugRegex =
    /\b(paracetamol|ibuprofen|aspirin|kháng sinh|kháng viêm|acetaminophen|amoxicillin|azithromycin|panadol|hapacol|efferalgan)\b/gi;
  let match;
  while ((match = drugRegex.exec(text))) {
    drugs.push(match[0]);
  }

  const symptoms = [];
  const symptomRegex =
    /\b(đau đầu|sốt|ho|khó thở|đau bụng|nôn|buồn nôn|mẩn đỏ|ngứa|chóng mặt|mệt mỏi|tiêu chảy|đau ngực|đau lưng|đau khớp|phát ban|sưng|viêm|chảy máu|co giật|bất tỉnh)\b/gi;
  while ((match = symptomRegex.exec(text))) {
    symptoms.push(match[0]);
  }

  const dates = [];
  const dateRegex =
    /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|ngày [0-9]{1,2}|tháng [0-9]{1,2}|hôm nay|ngày mai|ngày kia|hôm qua|tuần trước|tuần này|tháng trước|tháng này)\b/gi;
  while ((match = dateRegex.exec(text))) {
    dates.push(match[0]);
  }

  return { drugs, symptoms, dates };
}

export async function parseIntent(
  message: string
): Promise<ParsedIntent & { entities?: any }> {
  const sys = intentPrompt();

  const resp = await ai.models.generateContent({
    model: MODEL_AI,
    contents: [{ text: sys }, { text: `Câu hỏi: "${message}"` }],
  });

  const text = (resp as any)?.response?.text?.() ?? (resp as any)?.text ?? "{}";

  const cleanedText = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleanedText);
    const normalized = normalizeParsed(parsed, message);
    // Thêm entity nhận diện được vào kết quả
    return { ...normalized, entities: extractEntities(message) };
  } catch {
    // Nếu JSON fail, fallback "medical_qa" để vẫn trả lời các câu hỏi y tế
    return {
      intent: "medical_qa",
      args: { symptoms: "" },
      entities: extractEntities(message),
    };
  }
}
