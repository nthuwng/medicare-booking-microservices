// src/services/ai.registry.ts
import { ParsedIntent } from "src/validations/ai.intent";
import { AiRuntimeCtx } from "src/types/ai.runtime";
import {
  handleRecommendSpecialtyFromImage,
  handleRecommendSpecialtyText,
  handleSpecialtyDoctorCheck,
} from "./ai.tools";
import { handleMedicalQA } from "./ai.tools";
// ^ dùng đúng file export của bạn (ai.tools hoặc ai.service)

// helper nhỏ để parse JSON lỏng nếu cần
function tryParseJSON(s: string) {
  try {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(s.slice(start, end + 1));
    }
  } catch {}
  return null;
}

export const dispatchByIntent = async (
  parsed: ParsedIntent,
  ctx?: AiRuntimeCtx
) => {
  switch (parsed.intent) {
    case "smalltalk":
      return {
        intent: "smalltalk",
        content:
          "MediCare xin chào! Tôi là Trợ lý AI của MediCare, hãy cho tôi biết câu hỏi của bạn ?",
      };

    case "recommend_specialty_image": {
      if (!ctx?.image) {
        return {
          intent: "recommend_specialty_image",
          content: "Thiếu ảnh đầu vào.",
          data: null,
          error: { code: "BAD_REQUEST", message: "image is required" },
        };
      }

      // symptoms có thể lấy từ parsed.args hoặc prompt trong ctx
      const symptoms = (parsed.args?.symptoms || ctx.prompt || "").trim();

      // nếu hàm của bạn là dạng (sys, model, user, file, base64)
      const sys =
        "You are a triage assistant. Respond strict JSON: specialty (vn), confidence (0.0-1), reasoning (vn).";
      const user = `Ảnh triệu chứng. Thông tin bổ sung: ${
        symptoms || "không có"
      }. Chỉ trả JSON.`;
      const text = await handleRecommendSpecialtyFromImage(
        sys,
        ctx.modelImage || process.env.GEMINI_MODEL_NAME!,
        user,
        ctx.image, // <- file
        ctx.image.base64 ?? ctx.image.buffer.toString("base64") // <- base64
      );

      const rawObj = text ? tryParseJSON(text) : null;
      const specialtyName =
        rawObj?.specialty_name || rawObj?.specialty || "Nội tổng quát";
      const confidence =
        typeof rawObj?.confidence === "number" ? rawObj.confidence : 0.6;
      const reasoning = rawObj?.reasoning || "";

      return {
        intent: "recommend_specialty_image",
        content: `Chuyên khoa phù hợp: ${specialtyName}. Độ tin cậy ~ ${Math.round(
          confidence * 100
        )}%`,
        data: rawObj
          ? { specialty_name: specialtyName, confidence, reasoning }
          : null,
      };
    }

    case "recommend_specialty_text": {
      const symptoms = (parsed.args?.symptoms || "").trim();
      const result = await handleRecommendSpecialtyText(symptoms);
      return {
        intent: "recommend_specialty_text",
        content: result.content ?? "Bạn mô tả rõ triệu chứng giúp mình nhé.",
        data: result.data,
      };
    }

    case "medical_qa": {
      const question = (ctx?.prompt || parsed.args?.symptoms || "").trim();
      const result = await handleMedicalQA(question);
      return {
        intent: "medical_qa",
        content: result.content ?? "Xin lỗi, tôi chưa có câu trả lời phù hợp.",
        data: null,
      };
    }

    case "specialty_doctor_check": {
      const specialtyName = (parsed.args?.symptoms || "").trim();
      const result = await handleSpecialtyDoctorCheck(specialtyName);

      if (!result || result.length === 0) {
        return {
          intent: "specialty_doctor_check",
          success: false,
          length: result.length,
          content:
            "Kiểm tra thông tin bác sĩ thuộc chuyên khoa này thành công.",
          data: result,
        };
      }
      return {
        intent: "specialty_doctor_check",
        success: true,
        length: result.length,
        content: "Kiểm tra thông tin bác sĩ thuộc chuyên khoa này thành công.",
        data: result,
      };
    }

    case "other": {
      return {
        intent: "other",
        content:
          "Xin lỗi, câu hỏi của bạn không thuộc lĩnh vực tôi có thể trả lời. Vui lòng hỏi câu hỏi khác. Xin cảm ơn",
      };
    }
  }
};
