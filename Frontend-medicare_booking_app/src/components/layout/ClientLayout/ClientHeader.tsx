import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { RiAdminFill } from "react-icons/ri";
import { useCurrentApp } from "@/components/contexts/app.context";
import { useEffect } from "react";
import ThemeToggle from "@/components/common/ThemeToggle";

const ClientHeader = () => {
  const {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
    isAppLoading,
    refreshUserData,
    theme,
  } = useCurrentApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !user && !isAppLoading) {
      refreshUserData();
    }
  }, [isAuthenticated, user, isAppLoading, refreshUserData]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  const itemsDropdown = [
    ...(user?.userType === "ADMIN"
      ? [{ label: <Link to="/admin">Trang quản trị</Link>, key: "admin" }]
      : []),
    ...(user?.userType === "DOCTOR"
      ? [{ label: <Link to="/doctor">Trang bác sĩ</Link>, key: "doctor" }]
      : []),
    ...(user?.userType === "PATIENT"
      ? [
          {
            label: <Link to="/my-account">Quản lý tài khoản</Link>,
            key: "my-account",
          },
        ]
      : []),
    {
      label: (
        <span className="cursor-pointer text-red-500" onClick={handleLogout}>
          Đăng xuất
        </span>
      ),
      key: "logout",
    },
  ];

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 h-16
        border-b transition
        ${
          theme === "dark"
            ? "bg-[#0D1224] border-white/10"
            : "bg-white border-gray-200"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        {/* ✅ LOGO */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold">
            <span
              className={`transition ${
                theme === "dark" ? "text-white" : "text-blue-800"
              }`}
            >
              Medi
            </span>
            <span
              className={`transition ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Care
            </span>
          </h1>
        </Link>

        {/* ✅ MENU */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`!font-bold transition ${
              theme === "dark"
                ? "!text-white hover:!text-blue-400 !leading-tight"
                : "!text-blue-800 hover:!text-orange-400"
            }`}
          >
            Trang chủ
          </Link>

          <Link
            to="/booking-options"
            className={`!font-bold transition ${
              theme === "dark"
                ? "!text-white hover:!text-blue-400 !leading-tight"
                : "!text-blue-800 hover:!text-orange-400"
            }`}
          >
            Đặt lịch
          </Link>

          <Link
            to="/about"
            className={`!font-bold transition ${
              theme === "dark"
                ? "!text-white hover:!text-blue-400 !leading-tight"
                : "!text-blue-800 hover:!text-orange-400"
            }`}
          >
            Giới thiệu
          </Link>

          <Link
            to="/contact"
            className={`!font-bold transition ${
              theme === "dark"
                ? "!text-white hover:!text-blue-400 !leading-tight"
                : "!text-blue-800 hover:!text-orange-400"
            }`}
          >
            Liên hệ
          </Link>
        </nav>

        {/* ✅ AUTH + THEME */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Chưa đăng nhập */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`font-medium transition ${
                  theme === "dark"
                    ? "text-blue-300 hover:text-blue-200"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                Đăng nhập
              </Link>

              <span className="text-gray-400">|</span>

              <Link
                to="/register"
                className={`font-medium transition ${
                  theme === "dark"
                    ? "text-blue-300 hover:text-blue-200"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden sm:block max-w-[250px]">
                <div
                  className={`text-sm text-gray-600 ${
                    theme === "dark" ? "text-white" : "text-sm text-gray-600"
                  }`}
                >
                  Xin chào
                </div>
                <div
                  className={`font-medium text-gray-900 truncate${
                    theme === "dark"
                      ? "text-white"
                      : "font-medium text-gray-900 truncate"
                  }`}
                >
                  {isAppLoading ? (
                    <span
                      className={`text-sm text-gray-400 ${
                        theme === "dark" ? "!text-gray-400" : "!text-white"
                      }`}
                    >
                      Loading...
                    </span>
                  ) : user?.email && user.email !== "" ? (
                    user.email.length > 25 ? (
                      <span
                        className={`text-sm text-gray-400 ${
                          theme === "dark" ? "!text-white" : "!text-black"
                        }`}
                      >
                        {user.email.substring(0, 25) + "..."}
                      </span>
                    ) : (
                      <span
                        className={`text-sm text-gray-400 ${
                          theme === "dark" ? "!text-white" : "!text-black"
                        }`}
                      >
                        {user.email}
                      </span>
                    )
                  ) : user?.userType === "ADMIN" ? (
                    <span
                      className={`text-sm text-gray-400 ${
                        theme === "dark" ? "!text-white" : "!text-black"
                      }`}
                    >
                      Admin
                    </span>
                  ) : user?.userType === "DOCTOR" ? (
                    <span
                      className={`text-sm text-gray-400 ${
                        theme === "dark" ? "!text-white" : "!text-black"
                      }`}
                    >
                      Doctor
                    </span>
                  ) : user?.userType === "PATIENT" ? (
                    <span
                      className={`text-sm text-gray-400 ${
                        theme === "dark" ? "!text-white" : "!text-black"
                      }`}
                    >
                      Patient
                    </span>
                  ) : (
                    <span
                      className={`text-sm text-gray-400 ${
                        theme === "dark" ? "!text-white" : "!text-black"
                      }`}
                    >
                      User
                    </span>
                  )}
                </div>
              </div>
              <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
                <div
                  className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition
                  ${
                    theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }
                `}
                >
                  <div
                    className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    ${theme === "dark" ? "bg-blue-900" : "bg-blue-100"}
                  `}
                  >
                    <RiAdminFill
                      className={`
                      text-lg
                      ${theme === "dark" ? "text-blue-300" : "text-blue-600"}
                    `}
                    />
                  </div>

                  <svg
                    className={`w-4 h-4 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
