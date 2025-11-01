import { Card, Typography, Row, Col } from "antd";
import { MedicineBoxOutlined, HomeOutlined } from "@ant-design/icons";
import { Stethoscope } from "lucide-react";
import { useCurrentApp } from "@/components/contexts/app.context";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

type ColorKey = "blue" | "green" | "purple";

const LIGHT: Record<ColorKey, any> = {
  blue: {
    iconText: "text-blue-600",
    iconBg: "bg-blue-50",
    pillBg: "bg-blue-50",
    pillText: "text-blue-700",
    titleHover: "group-hover:!text-blue-600",
  },
  green: {
    iconText: "text-green-600",
    iconBg: "bg-green-50",
    pillBg: "bg-green-50",
    pillText: "text-green-700",
    titleHover: "group-hover:!text-green-600",
  },
  purple: {
    iconText: "text-purple-600",
    iconBg: "bg-purple-50",
    pillBg: "bg-purple-50",
    pillText: "text-purple-700",
    titleHover: "group-hover:!text-purple-600",
  },
};

const DARK: Record<ColorKey, any> = {
  blue: {
    iconText: "text-blue-300",
    iconBg: "bg-blue-800/40",
    pillBg: "bg-blue-800/40",
    pillText: "text-blue-200",
    titleHover: "group-hover:!text-blue-200",
  },
  green: {
    iconText: "text-green-300",
    iconBg: "bg-green-800/40",
    pillBg: "bg-green-800/40",
    pillText: "text-green-200",
    titleHover: "group-hover:!text-green-200",
  },
  purple: {
    iconText: "text-purple-300",
    iconBg: "bg-purple-800/40",
    pillBg: "bg-purple-800/40",
    pillText: "text-purple-200",
    titleHover: "group-hover:!text-purple-200",
  },
};

const OPTIONS = [
  {
    id: "doctor",
    title: "Đặt lịch theo Bác sĩ",
    description: "Tìm và đặt lịch với bác sĩ cụ thể mà bạn tin tưởng.",
    image: "/ForYouSection/Doctor-section.jpg",
    icon: <Stethoscope />,
    color: "blue" as ColorKey,
    path: "/booking-options/doctor",
    hint: "Cá nhân hoá theo bác sĩ",
  },
  {
    id: "specialty",
    title: "Đặt lịch theo Chuyên khoa",
    description: "Chọn chuyên khoa phù hợp với tình trạng sức khỏe của bạn.",
    image: "/ForYouSection/Specialty-section.jpg",
    icon: <MedicineBoxOutlined />,
    color: "green" as ColorKey,
    path: "/booking-options/specialty",
    hint: "Tập trung theo triệu chứng",
  },
  {
    id: "clinic",
    title: "Đặt lịch theo Phòng khám",
    description: "Chọn địa điểm thuận tiện để di chuyển và tái khám.",
    image: "/ForYouSection/Clinic-section.jpg",
    icon: <HomeOutlined />,
    color: "purple" as ColorKey,
    path: "/booking-options/clinic",
    hint: "Ưu tiên vị trí gần bạn",
  },
];

const BookingOptions = () => {
  const { theme } = useCurrentApp();
  const navigate = useNavigate();
  const tone = theme === "dark" ? DARK : LIGHT;

  return (
    <div className="max-w-7xl mx-auto">
      <Row gutter={[24, 24]}>
        {OPTIONS.map((opt) => {
          const c = tone[opt.color];
          return (
            <Col key={opt.id} xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                hoverable
                onClick={() => navigate(opt.path)}
                className={`
                  group rounded-2xl overflow-hidden cursor-pointer
                  transition-all duration-300 hover:-translate-y-1 !shadow-md !shadow-zinc-800/50
                  border
                  ${
                    theme === "dark"
                      ? "!bg-[#0f1b2d] border-white/10"
                      : "!bg-white border-gray-100"
                  }
                `}
                bodyStyle={{
                  padding: 0,
                  background: "transparent",
                }}
              >
                {/* ép body antd không được trắng */}
                <div
                  className={`${
                    theme === "dark" ? "!bg-[#0f1b2d]" : "!bg-white"
                  }`}
                >
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <img
                      src={opt.image}
                      alt={opt.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2 mt-1">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.iconBg}`}
                      >
                        <span className={`text-2xl ${c.iconText}`}>
                          {opt.icon}
                        </span>
                      </div>

                      <Title
                        level={3}
                        className={`
                          !font-semibold !mb-0 !text-[23px]
                          ${theme === "dark" ? "!text-white" : "!text-gray-800"}
                          transition-colors duration-300
                          ${c.titleHover}
                        `}
                      >
                        {opt.title}
                      </Title>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 mb-3 text-[14px] font-medium ${c.pillBg} ${c.pillText}`}
                    >
                      💡 {opt.hint}
                    </div>

                    <Paragraph
                      className={`
                        !m-0 !leading-relaxed !text-[16.5px]
                        ${
                          theme === "dark" ? "!text-gray-300" : "!text-gray-600"
                        }
                      `}
                    >
                      {opt.description}
                    </Paragraph>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default BookingOptions;
