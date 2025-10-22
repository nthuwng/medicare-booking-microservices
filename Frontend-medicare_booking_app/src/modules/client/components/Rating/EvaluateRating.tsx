import { Modal, Rate, Input, Typography, Divider, App } from "antd";
import { StarFilled } from "@ant-design/icons";
import { useState } from "react";
import { createRatingAPI } from "../../services/client.api";

interface props {
  ratingModalOpen: boolean;
  setRatingModalOpen: (open: boolean) => void;
  userId: string;
  doctorId: string;
}

const { Text } = Typography;

const EvaluateRating = (props: props) => {
  const { ratingModalOpen, setRatingModalOpen, userId, doctorId } = props;
  const [score, setScore] = useState<number>(0);
  const [content, setContent] = useState<string>("");
  const { message } = App.useApp();

  const handleSubmit = async () => {
    if (!userId || !doctorId) return;
    const res = await createRatingAPI(doctorId, score, content);
    if (res.data) {
      setRatingModalOpen(false);
      message?.success("Đánh giá thành công");
    } else {
      message?.error(res.message);
    }
  };

  return (
    <Modal
      width={650}
      open={ratingModalOpen}
      title={<span>Đánh giá bác sĩ</span>}
      onOk={handleSubmit}
      onCancel={() => setRatingModalOpen(false)}
      okText="Gửi đánh giá"
      cancelText="Hủy"
      confirmLoading={false}
    >
      <div className="space-y-3 pb-4">
        <div className="flex items-center gap-3">
          <Rate
            allowHalf
            value={score}
            onChange={setScore}
            character={<StarFilled />}
          />
          <Text className="text-gray-700">
            {score ? `${score.toFixed(1)}/5` : "Chọn số sao"}
          </Text>
        </div>

        <Divider className="!my-2" />

        <Input.TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          autoSize={{ minRows: 4, maxRows: 6 }}
          maxLength={1000}
          showCount
        />
      </div>
    </Modal>
  );
};

export default EvaluateRating;
