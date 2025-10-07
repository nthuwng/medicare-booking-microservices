import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const handleGenerateScopedText = async () => {
  const REFUSAL_TEXT =
    "Xin lỗi, câu hỏi của bạn không thuộc lĩnh vực tôi có thể trả lời. Vui lòng hỏi câu hỏi khác. Xin cảm ơn";

  const EXPLANATORY_TEXT = `Tôi là người thuộc lĩnh vực sức khỏe và y tế cơ bản, gợi ý chuyên khoa, tìm bác sĩ, đặt lịch khám, thông tin dịch vụ trong ứng dụng MediCare. `;

  const HELLO_TEXT = `MediCare xin chào! Tôi là Trợ lý AI của MediCare, hãy cho tôi biết câu hỏi của bạn.`;

  const systemInstruction =
    "Bạn là Trợ lý AI MediCare, chỉ hỗ trợ các chủ đề: sức khỏe/y tế cơ bản, gợi ý chuyên khoa, tìm bác sĩ, đặt lịch khám, thông tin dịch vụ trong ứng dụng MediCare. " +
    `Nếu câu hỏi KHÔNG thuộc các chủ đề trên, phải trả lời CHÍNH XÁC: "${REFUSAL_TEXT}" và không thêm nội dung nào khác.` +
    `Nếu có câu hỏi bạn thuộc lĩnh vực nào thì bạn hãy trả lời CHÍNH XÁC: "${EXPLANATORY_TEXT}" và không thêm nội dung nào khác` +
    `Nếu câu hỏi là "Xin chào" hoặc "Chào bạn" hoặc "Chào" thì bạn hãy trả lời CHÍNH XÁC: "${HELLO_TEXT}" và không thêm nội dung nào khác`;

  return systemInstruction;
};

const handleAIService = async (
  systemInstruction: string,
  model: string,
  prompt: string
) => {
  const response = await ai.models.generateContent({
    model,
    contents: [{ text: systemInstruction }, { text: prompt }],
  });

  let text = response.text;

  text = text?.replace(/```json|```/g, ``).trim() || "";

  return text;
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
      { text: `${systemInstruction}\n\n${userPrompt}` },
      { inlineData: { mimeType: file.mimetype, data: base64 } },
    ],
  });

  let text = response.text || "";

  text = text.replace(/```json|```/g, "").trim();

  return text;
};

export {
  handleRecommendSpecialtyFromImage,
  handleGenerateScopedText,
  handleAIService,
};
