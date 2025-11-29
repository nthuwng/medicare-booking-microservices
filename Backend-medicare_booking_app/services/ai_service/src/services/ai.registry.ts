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
          "Xin chào! Mình là trợ lý AI của MediCare 😊 Mình có thể giúp bạn tư vấn sức khỏe, gợi ý chuyên khoa phù hợp, hoặc tìm bác sĩ. Bạn cần hỗ trợ gì hôm nay?",
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

      const symptoms = (parsed.args?.symptoms || ctx.prompt || "").trim();

      const sys = `You are a medical triage assistant. Classify the image STRICTLY:

ACCEPT (return specialty recommendation):
- Skin conditions, rashes, wounds, injuries (chân, tay, mặt, etc.)
- Body parts showing medical symptoms
- Medical test results, X-rays, scans
- Clear health-related content

REJECT (return "Không áp dụng"):
- UI screenshots, app interfaces, logos
- Non-medical general photos
- Blurry or unidentifiable medical content

RESPONSE FORMAT (ONLY JSON, no other text):
{
  "is_medical": <true|false>,
  "specialty_name": "<chuyên khoa tiếng Việt hoặc 'Không áp dụng'>",
  "confidence": <0.0-1.0>,
  "reasoning": "<giải thích ngắn tiếng Việt>"
}
  
IMPORTANT: If image contains MULTIPLE items/faces/elements mixed together:
- REJECT if most content is non-medical (UI, logos, icons)
- ACCEPT only if CLEARLY medical content is dominant;

`;

      const user = `Ảnh triệu chứng. Thông tin bổ sung: ${
        symptoms || "không có"
      }. Chỉ trả JSON.`;

      const text = await handleRecommendSpecialtyFromImage(
        sys,
        ctx.modelImage || process.env.GEMINI_MODEL_NAME!,
        user,
        ctx.image,
        ctx.image.base64 ?? ctx.image.buffer.toString("base64")
      );

      const rawObj = text ? tryParseJSON(text) : null;

      const specialtyName =
        rawObj?.specialty_name || rawObj?.specialty || "Nội tổng quát";
      const confidence =
        typeof rawObj?.confidence === "number" ? rawObj.confidence : 0.6;
      const reasoning = rawObj?.reasoning || "";

      // ⚠️ Nếu model bảo "Không áp dụng" hoặc confidence quá thấp → nói lại cho user dễ hiểu
      const isNotApplicable =
        specialtyName.toLowerCase().includes("không áp dụng") ||
        confidence <= 0.1;

      if (isNotApplicable) {
        return {
          intent: "recommend_specialty_image",
          content:
            "Ảnh bạn gửi có vẻ không phải hình ảnh y tế hoặc không đủ thông tin để tư vấn chuyên khoa. " +
            "Bạn có thể gửi lại ảnh rõ hơn (ví dụ vùng tổn thương, kết quả xét nghiệm) " +
            "hoặc mô tả triệu chứng bằng chữ để mình hỗ trợ chính xác hơn nhé! 😊",
          data: rawObj ? { specialtyName, confidence, reasoning } : null,
        };
      }

      return {
        intent: "recommend_specialty_image",
        content: `Dựa trên ảnh bạn gửi, mình nghĩ bạn nên khám chuyên khoa ${specialtyName} nhé!`,
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
        content:
          result.content ??
          "Bạn có thể mô tả rõ hơn về triệu chứng đang gặp phải không? Mình sẽ giúp bạn tìm chuyên khoa phù hợp nhất! 😊",
        data: result.data,
      };
    }

    case "medical_qa": {
      const question = (ctx?.prompt || parsed.args?.symptoms || "").trim();
      const result = await handleMedicalQA(question);
      return {
        intent: "medical_qa",
        content:
          result.content ??
          "Xin lỗi, mình chưa có thông tin đầy đủ để trả lời câu hỏi này. Bạn có thể hỏi cụ thể hơn hoặc tham khảo ý kiến bác sĩ trực tiếp nhé! 😊",
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
            "Hiện tại chưa có bác sĩ nào thuộc chuyên khoa này trong hệ thống. Bạn có thể thử tìm kiếm chuyên khoa khác hoặc liên hệ trực tiếp với phòng khám nhé! 😊",
          data: result,
        };
      }
      return {
        intent: "specialty_doctor_check",
        success: true,
        length: result.length,
        content: `Tuyệt vời! Mình đã tìm thấy ${result.length} bác sĩ chuyên khoa phù hợp cho bạn. Dưới đây là danh sách các bác sĩ có kinh nghiệm và uy tín! 👨‍⚕️👩‍⚕️`,
        data: result,
      };
    }

    case "other": {
      // Gợi ý lại cho user các câu hỏi liên quan hoặc xin thêm thông tin
      return {
        intent: "other",
        content:
          "Xin lỗi, mình chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về: \n" +
          "- Triệu chứng sức khỏe (ví dụ: 'Tôi bị đau đầu, nên khám khoa nào?')\n" +
          "- Hỏi về thuốc (ví dụ: 'Thuốc paracetamol dùng thế nào?')\n" +
          "- Đặt lịch khám, tìm bác sĩ, hoặc các vấn đề y tế khác.\n" +
          "\nBạn vui lòng mô tả rõ hơn để mình hỗ trợ chính xác nhé! 😊",
      };
    }
  }
};
