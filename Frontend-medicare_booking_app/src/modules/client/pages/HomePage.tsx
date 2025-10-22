import Banner from "../components/Banner/Banner";
import { Users, Clock, Award, Shield } from "lucide-react";
import BookingOptions from "../components/BookingOptions/BookingOptions";

const HomePage = () => {
  const stats = [
    {
      icon: <Users className="h-10 w-10 text-blue-600" />,
      number: "50,000+",
      label: "Bệnh nhân tin tưởng",
    },
    {
      icon: <Clock className="h-10 w-10 text-green-600" />,
      number: "24/7",
      label: "Hỗ trợ khẩn cấp",
    },
    {
      icon: <Award className="h-10 w-10 text-yellow-600" />,
      number: "200+",
      label: "Bác sĩ chuyên môn",
    },
    {
      icon: <Shield className="h-10 w-10 text-purple-600" />,
      number: "99.9%",
      label: "Độ tin cậy",
    },
  ];

  const features = [
    {
      title: "Đặt lịch trực tuyến",
      description: "Đặt lịch hẹn với bác sĩ nhanh chóng và tiện lợi",
      icon: "📅",
    },
    {
      title: "Tư vấn từ xa",
      description: "Nhận tư vấn y tế từ các chuyên gia hàng đầu",
      icon: "💻",
    },
    {
      title: "Hồ sơ điện tử",
      description: "Quản lý hồ sơ bệnh án một cách an toàn và bảo mật",
      icon: "📋",
    },
    {
      title: "Thanh toán trực tuyến",
      description: "Thanh toán viện phí nhanh chóng và an toàn",
      icon: "💳",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/*Banner */}
      <Banner />

      {/* Statistics Section */}
      <section
        className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        style={{
          backgroundImage: `
          radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
          radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              MediCare - Nơi tin tưởng của bạn
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Với nhiều năm kinh nghiệm trong lĩnh vực y tế, chúng tôi cam kết
              mang đến dịch vụ chăm sóc sức khỏe tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tại sao chọn MediCare?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi cung cấp những dịch vụ y tế hiện đại và tiện lợi nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-200"
              >
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For You Section */}
      <section className="bg-gray-50 py-12 font-sans w-full" 
      
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Dành cho bạn
            </h2>
            <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá các dịch vụ chăm sóc sức khỏe nổi bật và phù hợp với nhu
              cầu của bạn.
            </p>
          </div>
          <BookingOptions />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu hành trình chăm sóc sức khỏe?
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Đăng ký ngay hôm nay để nhận được những ưu đãi đặc biệt và dịch vụ
            chăm sóc sức khỏe tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[250px]">
              Đăng ký miễn phí
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 min-w-[250px]">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
