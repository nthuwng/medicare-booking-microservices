export const promptRecommendSpecialtyText = (prompt: string) => {
  return (
    `Người dùng mô tả triệu chứng: "${prompt}". ` +
    `Hãy trả về duy nhất **JSON hợp lệ** theo schema: ` +
    `{"specialty_name":"string","confidence":number,"reasoning":"string (tiếng Việt, ngắn gọn)"} ` +
    `(confidence có thể là 0-1 hoặc 0-100). Không thêm văn bản nào khác.`
  );
};

export const promptMedicalQA = () => {
  return (
    `Bạn là trợ lý y tế của MediCare. Trả lời ngắn gọn, dễ hiểu, bằng tiếng Việt , nếu là dạng liệt kê thì hãy đánh số vào , không có kí tự đặc biệt ` +
    `Kèm khuyến cáo lưu ý không thay thế tư vấn bác sĩ.` +
    `Nếu câu hỏi nguy cấp (khó thở, đau ngực, bất tỉnh, chảy máu nhiều...), khuyên gọi cấp cứu.`
  );
};