import { Card, Typography, Row, Col } from "antd";
import { MedicineBoxOutlined, HomeOutlined } from "@ant-design/icons";
import { Stethoscope } from "lucide-react";

const { Title, Paragraph } = Typography;

type ColorKey = "blue" | "green" | "purple";

const COLOR_STYLES: Record<
  ColorKey,
  {
    iconText: string;
    iconBg: string;
    ringHover: string;
    btn: string;
    btnHover: string;
    btnFocus: string;
    pillText: string;
    pillBg: string;
    titleHover: string;
  }
> = {
  blue: {
    iconText: "text-blue-600",
    iconBg: "bg-blue-50",
    ringHover: "hover:ring-blue-100",
    btn: "bg-blue-600",
    btnHover: "hover:bg-blue-700",
    btnFocus: "focus:ring-blue-300",
    pillText: "text-blue-700",
    pillBg: "bg-blue-50",
    titleHover: "group-hover:!text-blue-600",
  },
  green: {
    iconText: "text-green-600",
    iconBg: "bg-green-50",
    ringHover: "hover:ring-green-100",
    btn: "bg-green-600",
    btnHover: "hover:bg-green-700",
    btnFocus: "focus:ring-green-300",
    pillText: "text-green-700",
    pillBg: "bg-green-50",
    titleHover: "group-hover:!text-green-600",
  },
  purple: {
    iconText: "text-purple-600",
    iconBg: "bg-purple-50",
    ringHover: "hover:ring-purple-100",
    btn: "bg-purple-600",
    btnHover: "hover:bg-purple-700",
    btnFocus: "focus:ring-purple-300",
    pillText: "text-purple-700",
    pillBg: "bg-purple-50",
    titleHover: "group-hover:!text-purple-600",
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
    description:
      "Chọn chuyên khoa phù hợp với tình trạng sức khỏe hiện tại của bạn.",
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
  return (
    <div className="max-w-7xl mx-auto">
      <Row gutter={[24, 24]}>
        {OPTIONS.map((opt) => {
          const c = COLOR_STYLES[opt.color];

          return (
            <Col key={opt.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                onClick={() => window.location.assign(opt.path)}
                className={[
                  "h-full border-0 shadow-md transition-all duration-300",
                  "ring-1 ring-gray-100",
                  c.ringHover,
                  "group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
                ].join(" ")}
              >
                <div className="relative h-48 md:h-56 overflow-hidden rounded-lg shadow transition-shadow duration-300 hover:shadow-xl group">
                  <img
                    src={opt.image}
                    alt={opt.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Nội dung thẻ */}
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className="flex items-center gap-3 mb-2 mt-3">
                    <div
                      className={[
                        "rounded-2xl p-3",
                        c.iconBg,
                        "w-12 h-12 flex items-center justify-center",
                      ].join(" ")}
                    >
                      <span className={["text-2xl", c.iconText].join(" ")}>
                        {opt.icon}
                      </span>
                    </div>
                    <Title
                      level={3}
                      className={[
                        "!font-semibold !text-gray-800 !mb-0 !text-[23px] transition-colors duration-300",
                        c.titleHover,
                      ].join(" ")}
                    >
                      {opt.title}
                    </Title>
                  </div>

                  {/* Hint pill */}
                  <div
                    className={[
                      "mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1",
                      "text-[14px] font-medium",
                      c.pillBg,
                      c.pillText,
                    ].join(" ")}
                  >
                    <span>💡</span>
                    <span>{opt.hint}</span>
                  </div>

                  <div>
                    <Paragraph className="!text-gray-600 !leading-relaxed !mb-0 !text-[17px]">
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
