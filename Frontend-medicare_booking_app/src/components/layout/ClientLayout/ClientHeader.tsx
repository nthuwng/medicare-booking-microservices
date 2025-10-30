import { Link } from "react-router-dom";
import { useCurrentApp } from "@/components/contexts/app.context";
import { Dropdown } from "antd";
import { RiAdminFill } from "react-icons/ri";
import { useEffect } from "react";
import "./layout.client.css";

const ClientHeader = () => {
  const {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
    isAppLoading,
    refreshUserData,
  } = useCurrentApp();

  useEffect(() => {
    if (isAuthenticated && !user && !isAppLoading) {
      refreshUserData();
    }
  }, [isAuthenticated, user, isAppLoading, refreshUserData]);

  const handleLogout = () => {
    // Xóa token từ localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Reset trạng thái
    setIsAuthenticated(false);
    setUser(null);
  };

  const itemsDropdown = [
    ...(user?.userType === "ADMIN"
      ? [
          {
            label: <Link to={"/admin"}>Trang quản trị</Link>,
            key: "admin",
          },
        ]
      : []),
    ...(user?.userType === "DOCTOR"
      ? [
          {
            label: <Link to={"/doctor"}>Trang quản trị</Link>,
            key: "doctor",
          },
        ]
      : []),
    ...(user?.userType === "PATIENT"
      ? [
          {
            label: <Link to={"/my-account"}>Quản lý tài khoản</Link>,
            key: "my-account",
          },
        ]
      : []),

    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout",
    },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-white shadow-lg  border-b border-gray-100"
        // style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600 cursor-pointer">
              <Link to="/">
                <span className="text-blue-800">Medi</span>Care
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center group"
            >
              <span>Trang chủ</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>

            <Link
              to="/top-rate-doctors"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center group"
            >
              <span>Bác sĩ</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>

            <Link
              to="/booking-options"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center group"
            >
              <span>Đặt lịch</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>

            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center group"
            >
              <span>Giới thiệu</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-y-0.5 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>
            
          </nav>

          {/* Auth Section */}
          <div className="flex items-center w-[250px]">
            {!isAuthenticated ? (
              // Hiển thị nút Login/Register khi chưa đăng nhập
              <>
                <Link to="/login">
                  <button className="py-2 text-sky-600 font-medium hover:text-blue-900 transition-colors duration-200 cursor-pointer">
                    Đăng nhập
                  </button>
                </Link>
                <span className="text-blue-300 font-medium mr-2 ml-2">|</span>
                <Link to="/register">
                  <button className="py-2 text-sky-600 font-medium hover:text-blue-900 transition-colors duration-200 cursor-pointer">
                    Đăng ký
                  </button>
                </Link>
              </>
            ) : (
              // Hiển thị thông tin người dùng và nút logout khi đã đăng nhập
              <>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block max-w-[250px]">
                    <div className="text-sm text-gray-600">Xin chào</div>
                    <div className="font-medium text-gray-900 truncate">
                      {isAppLoading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : user?.email && user.email !== "" ? (
                        user.email.length > 25 ? (
                          user.email.substring(0, 25) + "..."
                        ) : (
                          user.email
                        )
                      ) : user?.userType === "ADMIN" ? (
                        "Admin"
                      ) : user?.userType === "DOCTOR" ? (
                        "Doctor"
                      ) : user?.userType === "PATIENT" ? (
                        "Patient"
                      ) : (
                        "User"
                      )}
                    </div>
                  </div>
                  <Dropdown
                    menu={{ items: itemsDropdown }}
                    trigger={["click"]}
                    overlayClassName="client-user-dropdown"
                  >
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <RiAdminFill className="text-blue-600 text-lg" />
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </Dropdown>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default ClientHeader;
