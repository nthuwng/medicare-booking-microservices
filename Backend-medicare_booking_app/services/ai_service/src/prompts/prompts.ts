export const promptRecommendSpecialtyText = (prompt: string) => {
  return [
    // Ngữ cảnh rất ngắn gọn, kiểu hội thoại
    `Mình có triệu chứng: "${prompt}". Bạn là bác sĩ AI, giúp mình xem nên khám chuyên khoa nào nhé.`,
    // Yêu cầu đầu ra: CHỈ JSON, không chữ nào khác
    `Chỉ trả về **một JSON hợp lệ duy nhất** đúng mẫu:`,
    `{"specialty_name":"string","confidence":number,"reasoning":"string (tiếng Việt, ngắn gọn, tự nhiên)"}`,
    // Quy định confidence + luật cấp cứu
    `- "confidence": trong khoảng 0–1 hoặc 0–100 đều được.`,
    `- Nếu có dấu hiệu nguy cấp (khó thở, đau ngực dữ dội, liệt nửa người, bất tỉnh, chảy máu nhiều...),`,
    `  thì "specialty_name" = "Cấp cứu", "confidence" = 1, và "reasoning" nêu rõ dấu hiệu cấp cứu.`,
    // Ví dụ vài-shot ngắn để model “bắt nhịp” hội thoại (vẫn chỉ JSON)
    `Ví dụ:`,
    `{"specialty_name":"Da liễu","confidence":0.82,"reasoning":"Ngứa và phát ban gợi ý bệnh da liễu."}`,
    `{"specialty_name":"Cấp cứu","confidence":1,"reasoning":"Đau ngực dữ dội và khó thở là dấu hiệu cấp cứu."}`,
    // Rào chắn cuối
    `Không viết thêm bất kỳ ký tự nào ngoài JSON.`,
  ].join(" ");
};

export const promptMedicalQA = () => {
  return (
    `Bạn là trợ lý y tế thân thiện của MediCare. Hãy trò chuyện như một bác sĩ đang tư vấn cho bệnh nhân. ` +
    `Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu và thân thiện. ` +
    `Nếu cần liệt kê thì đánh số thứ tự, tránh ký tự đặc biệt. ` +
    `Luôn nhắc nhở: "Thông tin này chỉ mang tính tham khảo, không thay thế tư vấn trực tiếp từ bác sĩ." ` +
    `Nếu có dấu hiệu nguy cấp (khó thở, đau ngực, bất tỉnh, chảy máu nhiều...), hãy khuyên gọi cấp cứu ngay lập tức.`
  );
};
