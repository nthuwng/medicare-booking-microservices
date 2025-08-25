import React from "react";
import { Typography, Button, Breadcrumb } from "antd";
import { HomeOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BookingOptions from "../../components/BookingOptions/BookingOptions";

const { Title, Paragraph, Text } = Typography;

const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={<RightOutlined className="text-gray-400" />}
            className="text-sm"
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className="!p-0 !h-auto !text-gray-600 hover:!text-blue-600"
                icon={<HomeOutlined />}
              >
                Trang chủ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="text-blue-600 font-medium">
              Hình thức đặt lịch
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* Header */}
      <header className="px-4 pt-8">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 !text-[14px]">
            Đặt lịch nhanh chóng • Bảo mật • Miễn phí
          </span>

          <Title
            level={1}
            className="!mt-2 !text-3xl sm:!text-4xl !font-bold !text-gray-800"
          >
            Đặt lịch khám bệnh
          </Title>

          <Paragraph className="!text-gray-600 !text-base max-w-3xl mx-auto !text-[17px]">
            Chọn cách thức đặt lịch phù hợp nhất với nhu cầu của bạn. Chúng tôi
            cung cấp nhiều lựa chọn để bạn dễ dàng tìm được bác sĩ và thời gian
            phù hợp.
          </Paragraph>
        </div>
      </header>

      {/* Cards */}
      <BookingOptions />

      {/* Gợi ý phụ */}
      <div className="max-w-7xl mx-auto flex justify-center items-center text-center px-4 pb-8 pt-8">
        <Text className="text-gray-500 !text-[17px]">
          Chưa biết bắt đầu từ đâu? Hãy thử{" "}
          <button
            onClick={() => navigate("/booking/specialty")}
            className="underline decoration-dashed underline-offset-4 hover:text-gray-700 transition-colors"
          >
            Chuyên khoa
          </button>{" "}
          để được gợi ý phù hợp.
        </Text>
      </div>
    </div>
  );
};

export default BookingPage;
