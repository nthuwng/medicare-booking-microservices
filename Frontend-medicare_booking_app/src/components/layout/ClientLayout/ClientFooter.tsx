import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
} from "lucide-react";

const ClientFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer 
    // className="mt-auto bg-gray-900 text-white"
    style={{
      background: "#000000",
      backgroundImage: `
        radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.2) 1px, transparent 0),
        radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.18) 1px, transparent 0),
        radial-gradient(circle at 1px 1px, rgba(236, 72, 153, 0.15) 1px, transparent 0)
      `,
      backgroundSize: "20px 20px, 30px 30px, 25px 25px",
      backgroundPosition: "0 0, 10px 10px, 15px 5px",
      marginTop: "auto",
    }}


 
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-400">
                <span className="text-blue-300">Medi</span>Care
              </h3>
              <p className="text-gray-300 mt-4 leading-relaxed">
                Hệ thống đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam. Kết
                nối bệnh nhân với các bác sĩ chuyên môn cao, mang đến dịch vụ
                chăm sóc sức khỏe chất lượng.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Đặt lịch khám
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Đăng nhập
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Dịch vụ</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Khám tổng quát
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Tư vấn từ xa
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Xét nghiệm
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Chẩn đoán hình ảnh
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Phẫu thuật
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Liên hệ</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a
                  href="tel:+84123456789"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  0356566573
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a
                  href="https://mail.google.com/mail/u/1/#inbox"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  nguyenthinhhung150603@gmail.com
                </a>
              </div>
            </div>

            {/* Working Hours */}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-300">
              <span>© {currentYear} MediCare. Được tạo với</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>tại Việt Nam</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                Chính sách bảo mật
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;
