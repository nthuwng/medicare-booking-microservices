import { Typography, Button, Breadcrumb } from "antd";
import { HomeOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BookingOptions from "../../components/BookingOptions/BookingOptions";
import { useCurrentApp } from "@/components/contexts/app.context";

const { Title, Paragraph, Text } = Typography;

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useCurrentApp();

  return (
    <div
      className="bg-gradient-to-b from-white to-gray-50"
      style={{
        ...(theme === "dark"
          ? { background: "#0D1224" }
          : {
              backgroundImage: `
          linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
          radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
          radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
        `,
              backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
            }),
      }}
    >
      {/* Breadcrumb Navigation */}
      <div
        className={`bg-white border-b ${
          theme === "dark" ? "!bg-[#0f1b2d]" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={
              <RightOutlined
                className={`${
                  theme === "dark" ? "!text-white" : "text-gray-500"
                }`}
              />
            }
            className="text-sm"
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className={`!font-bold !p-0 !h-auto ${
                  theme === "dark"
                    ? "!text-gray-400 hover:!text-blue-400 hover:!font-bold"
                    : "!text-gray-600 hover:!text-blue-600 hover:!font-bold"
                }`}
                icon={<HomeOutlined />}
              >
                Trang chủ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className={`!font-bold ${
                theme === "dark" ? "!text-blue-400" : "text-blue-600"
              }`}
            >
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
            className={`
              text-3xl md:text-[40px] font-extrabold leading-tight transition
              ${theme === "dark" ? "!text-white" : "text-gray-900"}
            `}
          >
            Đặt lịch khám bệnh
          </Title>

          <Paragraph
            className={`
              leading-relaxed mb-6 transition
              ${theme === "dark" ? "!text-gray-300" : "!text-gray-700"}
            `}
          >
            Chọn cách thức đặt lịch phù hợp nhất với nhu cầu của bạn. Chúng tôi
            cung cấp nhiều lựa chọn để bạn dễ dàng tìm được bác sĩ và thời gian
            phù hợp.
          </Paragraph>
        </div>
      </header>

      {/* Cards */}
      <div className="mx-auto max-w-7xl px-4">
        <BookingOptions />
      </div>

      {/* Gợi ý phụ */}
      <div className="max-w-7xl mx-auto flex justify-center items-center text-center px-4 pb-8 pt-8">
        <Text
          className={`
              text-gray-500 !text-[17px] transition
              ${theme === "dark" ? "!text-gray-400" : "!text-gray-500"}
            `}
        >
          Chưa biết bắt đầu từ đâu? Hãy thử{" "}
          <button
            onClick={() => navigate("/booking-options/specialty")}
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
