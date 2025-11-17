// src/pages/AIPage.tsx
import { useState, useRef, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  App,
  Spin,
  Upload,
  Image,
  Tooltip,
} from "antd";
import {
  ArrowUpOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { chatWithAIAPI } from "../services/client.api";
import { FiPaperclip } from "react-icons/fi";
import IntentRenderer from "../components/AI/IntentRender";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo/LOGO_MEDICARE.png";
import { useCurrentApp } from "@/components/contexts/app.context";
import ThemeToggle from "@/components/common/ThemeToggle";

const { Content } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

/* ====================== PALETTE ====================== */
// Màu chat tối giản, dễ nhìn
const palette = {
  dark: {
    pageBg: "#050816", // nền tổng thể
    surface: "#0b1120", // thẻ / composer
    surface2: "#020617",
    border: "rgba(148,163,184,0.45)",
    text: "#e5e7eb",
    textMuted: "#9ca3af",
    textSoft: "#94a3b8",
    primary: "#38bdf8", // xanh nhạt
    shadow: "0 18px 45px rgba(15,23,42,0.8)",
    bubbleAI: "rgba(15,23,42,0.95)",
    bubbleUser: "#0369a1", // bong bóng user rõ hơn
  },
  light: {
    pageBg: "#f4f5fb", // nền tổng thể sáng hơn chút
    surface: "#ffffff", // card chính
    surface2: "#f9fafb", // composer
    border: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    textSoft: "#6b7280",
    primary: "#0ea5e9",
    shadow: "0 18px 45px rgba(15,23,42,0.08)",
    // bong bóng chat
    bubbleAI: "#ffffff", // AI: trắng
    bubbleUser: "#dbeafe", // User: xanh nhạt nhưng không quá chói
  },
};

interface Message {
  id: string;
  type: "user" | "ai";
  content: React.ReactNode;
  timestamp: Date;
  isLoading?: boolean;
  imageUrl?: string;
}

const AIPage = () => {
  // ====== giữ nguyên logic ======
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { message: antdMessage } = App.useApp();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, theme } = useCurrentApp();
  // ====== thêm đọc theme để đổi màu ======
  const isDark = theme === "dark";
  const C = isDark ? palette.dark : palette.light;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsSidebarCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNewChat = () => {
    setIsLoading(false);
    setMessages([]);
    setInputValue("");
    setHasStarted(false);
    setImageFile(null);
    setImagePreview(null);
    const container = messagesContainerRef.current;
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPickImage = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    return false; // chặn Upload auto-upload
  };

  const clearPickedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleQuickAsk = (text: string) => {
    setInputValue(text);
    handleSendMessage(text);
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const scrollToMessage = (id: string) => {
    const c = messagesContainerRef.current;
    const el = document.getElementById(`msg-${id}`);
    if (c && el) {
      const top = el.offsetTop - c.offsetTop;
      c.scrollTo({ top, behavior: "smooth" });
    } else {
      el?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const isNearBottom = () => {
    const c = messagesContainerRef.current;
    if (!c) return true;
    return c.scrollTop + c.clientHeight >= c.scrollHeight - 100;
  };

  const handleSendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed && !imageFile) return;

    if (!hasStarted) setHasStarted(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: trimmed || (imageFile ? "" : ""),
      timestamp: new Date(),
      imageUrl: imageFile ? imagePreview || undefined : undefined,
    };
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputValue("");
    setIsLoading(true);
    setTimeout(() => {
      scrollToMessage(userMessage.id);
    }, 0);

    try {
      let aiText = "";
      let displayContent: string | React.ReactNode = "";

      const res = await chatWithAIAPI(imageFile || new File([], ""), trimmed);

      if (res?.intent) {
        displayContent = (
          <IntentRenderer
            intent={res?.intent}
            text={res?.text}
            data={res?.data}
          />
        );
      } else {
        aiText = res?.error?.message ?? "Tôi không thể xử lí yêu cầu này.";
        displayContent = aiText;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessage.id
            ? { ...m, content: displayContent, isLoading: false }
            : m
        )
      );
      setImageFile(null);
      setTimeout(scrollToBottom, 50);
    } catch (e: any) {
      console.error(e);
      antdMessage.error("Gọi AI thất bại, vui lòng thử lại.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessage.id
            ? {
                ...m,
                content:
                  "Hệ thống AI của nhà cung cấp đang quá tải, bạn vui lòng thử lại sau ít phút nhé! 🙏",
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      clearPickedImage();
    }
  };

  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (hasStarted) setTimeout(scrollToBottom, 0);
  }, [hasStarted]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* CSS phạm vi trang */}
      <style>{`
         .ai-chat-page .composer textarea::placeholder {
         color: ${isDark ? "#64748b" : "#9ca3af"};
           opacity: 1;
      }

         /* Hide scrollbars on desktop */
         @media (min-width: 768px) {
           .ai-chat-page ::-webkit-scrollbar { width: 0px; background: transparent; }
         }

         ${
           isDark
             ? `
           .ai-chat-page .ant-tooltip-inner { background: ${C.surface2}; color: ${C.text}; }
           .ai-chat-page .ant-tooltip-arrow:before { background: ${C.surface2}; }
         `
             : ``
         }
         /* màu placeholder mặc định */
.ai-chat-page .composer-textarea::placeholder {
  color: #6b7280; /* light */
  opacity: 1;
}

/* dark mode */
.ai-chat-page .composer-textarea.is-dark::placeholder {
  color: #cbd5e1;
}
  /* ====== FIX SUGGESTIONS WIDTH & ALIGN ====== */
.ai-suggestions,
.ai-suggestions * { box-sizing: border-box; }

.ai-suggestions .ant-upload-wrapper,
.ai-suggestions .ant-upload-wrapper .ant-upload,
.ai-suggestions .ant-upload-select,
.ai-suggestions .ant-upload,
.ai-suggestions .ant-upload-list {
  display: block !important;
  width: 100% !important;
}

.ai-suggestions .ant-btn {
  width: 100% !important;          /* tất cả nút full width */
  display: flex !important;        /* căn trái nội dung giống nhau */
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  padding-left: 12px !important;   /* đồng bộ padding trái */
  padding-right: 12px !important;  /* đồng bộ padding phải */
}

/* chữ không tràn xấu khi sidebar hẹp */
.ai-suggestions .ant-btn > span {
  white-space: normal !important;
  line-height: 1.4 !important;
}

/* giữ biên dạng khi dark/light để không “giật” kích thước */
.ai-suggestions .ant-btn,
.ai-suggestions .ant-upload-wrapper .ant-btn {
  min-height: 32px; /* cùng chiều cao */
  border-radius: 8px;
}
  

       `}</style>

      <Layout
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
        }}
        className="ai-chat-page"
      >
        {/* Mobile backdrop overlay */}
        {isMobile && !isSidebarCollapsed && (
          <div
            onClick={() => setIsSidebarCollapsed(true)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
          />
        )}

        {/* SIDEBAR */}
        <div
          style={{
            width: isMobile ? "80%" : isSidebarCollapsed ? 100 : "15%",
            display: isMobile && isSidebarCollapsed ? "none" : "block",
            position: isMobile ? "fixed" : "relative",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            background: C.pageBg,
            height: "100vh",
            overflowY: isMobile ? "auto" : "visible",
            borderRight: `1px solid ${C.border}`,
            boxShadow: isDark ? "" : palette.light.shadow,
          }}
        >
          {/* Header (logo + theme) */}
          <div
            className="cursor-pointer"
            style={{
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarCollapsed ? "center" : "space-between",
              gap: 8,
            }}
          >
            <Link to="/" style={{ display: "inline-block" }}>
              {isSidebarCollapsed ? (
                <div
                  className="group mx-auto my-3 size-20 shrink-0 rounded-2xl backdrop-blur ring-1 ring-black/5 shadow-sm transition-all duration-300 hover:shadow-md"
                  style={{ background: isDark ? C.surface : "#ffffff" }}
                >
                  <img
                    src={Logo}
                    alt="Medicare Logo"
                    className="block w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 select-none pointer-events-none"
                  />
                </div>
              ) : (
                <div
                  className="text-2xl font-bold"
                  style={{ color: isDark ? C.text : "#1f2937" }}
                >
                  <span style={{ color: isDark ? C.text : "#1d4ed8" }}>
                    Medi
                  </span>
                  <span style={{ color: isDark ? C.primary : "#2563eb" }}>
                    Care
                  </span>
                </div>
              )}
            </Link>

            {/* 👉 Khi mở rộng: đặt nút bên phải */}
            {!isSidebarCollapsed && <ThemeToggle />}
          </div>

          {/* 👉 Khi THU GỌN: chèn 1 hàng riêng để luôn có nút */}
          {isSidebarCollapsed && (
            <div
              style={{
                padding: "0 12px 12px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ThemeToggle />
            </div>
          )}

          {/* Mobile close button */}
          {isMobile && !isSidebarCollapsed && (
            <div
              style={{
                padding: 12,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                icon={<CloseOutlined />}
                onClick={() => setIsSidebarCollapsed(true)}
                type="text"
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 12,
              height: isMobile ? "calc(100vh - 60px)" : "calc(100vh - 70px)",
              position: isMobile ? "static" : "sticky",
              top: isMobile ? 0 : 70,
              alignItems: isSidebarCollapsed ? "center" : "stretch",
              overflowY: "auto",
            }}
          >
            <Button
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              icon={
                isSidebarCollapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              style={{
                width: isSidebarCollapsed ? 80 : "100%",
                background: isDark ? C.surface : "#fff",
                color: isDark ? C.text : palette.light.text,
                borderColor: C.border,
              }}
            >
              {!isSidebarCollapsed && "Thu gọn"}
            </Button>
            <Button
              type="primary"
              style={{
                width: isSidebarCollapsed ? 80 : "100%",
                boxShadow: isDark ? "" : palette.light.shadow,
              }}
              icon={<PlusOutlined />}
              onClick={handleNewChat}
            >
              {!isSidebarCollapsed && "New chat"}
            </Button>
            <div
              style={{
                fontWeight: 600,
                color: isDark ? C.text : "#374151",
                marginTop: 8,
                display: isSidebarCollapsed ? "none" : "block",
              }}
            >
              Menu
            </div>
            <Button
              style={{
                width: isSidebarCollapsed ? 80 : "100%",
                background: isDark ? C.surface : "#fff",
                color: isDark ? C.text : palette.light.text,
                borderColor: C.border,
              }}
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              {!isSidebarCollapsed && "Trang chủ"}
            </Button>
            {user?.userType === "PATIENT" && (
              <Button
                style={{
                  width: isSidebarCollapsed ? 80 : "100%",
                  background: isDark ? C.surface : "#fff",
                  color: isDark ? C.text : palette.light.text,
                  borderColor: C.border,
                }}
                icon={<UserOutlined />}
                onClick={() => navigate("/my-account")}
              >
                {!isSidebarCollapsed && "Quản lí tài khoản"}
              </Button>
            )}

            {/* Suggestions */}
            {!isSidebarCollapsed && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: isDark ? C.text : "#374151",
                    marginBottom: 8,
                  }}
                >
                  Gợi ý câu hỏi
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* 1. Xin chào */}
                  <Button
                    block
                    style={{
                      background: isDark ? C.surface : "#fff",
                      color: isDark ? C.text : "",
                    }}
                    onClick={() => handleQuickAsk("Xin chào!")}
                  >
                    💬 Xin chào!
                  </Button>

                  {/* 2. Gợi ý theo triệu chứng */}
                  <Button
                    block
                    style={{
                      background: isDark ? C.surface : "#fff",
                      color: isDark ? C.text : "",
                    }}
                    onClick={() =>
                      handleQuickAsk(
                        "Tôi bị đau đầu và sốt nhẹ, nên khám chuyên khoa nào?"
                      )
                    }
                  >
                    🩺 Gợi ý chuyên khoa theo triệu chứng
                  </Button>

                  {/* 3. Gợi ý từ ảnh (Upload cần width:100%) */}
                  <div style={{ width: "100%" }}>
                    <Upload
                      beforeUpload={onPickImage}
                      showUploadList={false}
                      accept="image/*"
                      style={{ width: "100%" }} // <-- quan trọng
                    >
                      <Button
                        block // <-- quan trọng
                        style={{
                          background: isDark ? C.surface : "#fff",
                          color: isDark ? C.text : "",
                          width: "100%", // <-- dự phòng
                        }}
                      >
                        🖼️Gợi ý chuyên khoa từ ảnh (tải ảnh)
                      </Button>
                    </Upload>
                  </div>

                  {/* 4. Hỏi đáp y khoa */}
                  <Button
                    block
                    style={{
                      background: isDark ? C.surface : "#fff",
                      color: isDark ? C.text : "",
                    }}
                    onClick={() =>
                      handleQuickAsk(
                        "Bệnh tiểu đường type 2 có triệu chứng gì và điều trị thế nào?"
                      )
                    }
                  >
                    ❓ Hỏi đáp y khoa
                  </Button>

                  {/* 5. Tìm bác sĩ theo chuyên khoa */}
                  <Button
                    block
                    style={{
                      background: isDark ? C.surface : "#fff",
                      color: isDark ? C.text : "",
                    }}
                    onClick={() =>
                      handleQuickAsk("Tìm bác sĩ chuyên khoa Tim mạch giúp tôi")
                    }
                  >
                    👨‍⚕️ Tìm bác sĩ theo chuyên khoa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          {/* Mobile menu + theme toggle */}
          {isMobile && (
            <div
              style={{
                padding: 12,
                background: C.pageBg,
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Button
                onClick={() => setIsSidebarCollapsed((v) => !v)}
                icon={<MenuUnfoldOutlined />}
                style={{
                  flex: 1,
                  background: C.surface,
                  color: isDark ? C.text : C.text,
                  borderColor: C.border,
                }}
              >
                Menu
              </Button>
            </div>
          )}

          <Content
            style={{
              padding: isMobile ? "12px" : "24px",
              position: "relative",
              marginTop: isMobile ? "0px" : "70px",
              zIndex: 1,
              margin: "0 auto",
              height: "100vh",
              overflowY: "auto",
              background: C.pageBg,
            }}
          >
            {/* Landing hero (pre-chat) */}
            {!hasStarted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: isMobile ? "85vh" : "95vh",
                  flexDirection: "column",
                  gap: isMobile ? 16 : 24,
                }}
              >
                <Title
                  level={2}
                  className={
                    isMobile
                      ? "!text-2xl !leading-tight"
                      : "!text-4xl md:!text-4xl !leading-[1.2]"
                  }
                  style={{ color: isDark ? C.text : "#1d4ed8" }}
                >
                  <span className="inline-block pb-[2px]">
                    Trợ lí tìm thông tin về sức khỏe
                  </span>
                </Title>
                <Paragraph
                  className={`${
                    isMobile ? "!text-sm" : "!text-base md:!text-lg"
                  } !text-center !max-w-3xl !px-4`}
                  style={{ color: isDark ? C.textMuted : "#475569" }}
                >
                  Hỏi đáp y tế, gợi ý chuyên khoa, đặt lịch khám và hơn thế nữa.
                  Bạn có thể mô tả triệu chứng hoặc tải ảnh để nhận tư vấn chính
                  xác hơn.
                </Paragraph>
                <div
                  style={{
                    width: isMobile ? "100%" : "min(900px, 95%)",
                    background: C.surface,
                    borderRadius: 24,
                    padding: isMobile ? 12 : 12,
                    border: `1px solid ${C.border}`,
                    boxShadow: C.shadow,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {imagePreview && (
                      <div style={{ marginBottom: 4 }}>
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `1px solid ${C.border}`,
                            boxShadow: isDark
                              ? ""
                              : "0 4px 12px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Image
                            src={imagePreview}
                            alt="preview"
                            style={{
                              width: isMobile ? 100 : 120,
                              height: isMobile ? 100 : 120,
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              display: "flex",
                              gap: 6,
                            }}
                          >
                            <Button
                              size="small"
                              danger
                              shape="circle"
                              icon={<CloseOutlined />}
                              onClick={clearPickedImage}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Hãy hỏi tôi về sức khỏe, chuyên khoa, đặt lịch, y tế..."
                      className={`composer-textarea !no-scrollbar !mb-2 focus:!outline-none focus:!shadow-none ${
                        isDark ? "is-dark" : "is-light"
                      }`}
                      autoSize={{ minRows: 1, maxRows: 10 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          if (!isLoading && (inputValue.trim() || imageFile)) {
                            handleSendMessage(inputValue);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Ctrl+Enter để gửi tin nhắn
                        if (e.ctrlKey && e.key === "Enter") {
                          e.preventDefault();
                          if (!isLoading && (inputValue.trim() || imageFile)) {
                            handleSendMessage(inputValue);
                          }
                        }
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: isDark ? C.text : "#111827",
                        paddingTop: 4,
                        fontSize: isMobile ? "16px" : "20px",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Upload
                          beforeUpload={onPickImage}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button
                            shape="circle"
                            icon={<FiPaperclip size={18} />}
                            className="!size-10 hover:!brightness-110"
                            title="Tải ảnh lên"
                            style={{
                              background: isDark ? C.surface2 : "#fff",
                              color: isDark ? C.text : "",
                            }}
                          />
                        </Upload>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tooltip title="Gửi tin nhắn (Enter hoặc Ctrl+Enter)">
                          <Button
                            shape="circle"
                            loading={isLoading}
                            disabled={
                              isLoading || (!inputValue.trim() && !imageFile)
                            }
                            style={{
                              width: 40,
                              height: 40,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              background: isDark ? "#38bdf8" : "#0ea5e9",
                              border: "none",
                            }}
                            onClick={() => handleSendMessage(inputValue)}
                          >
                            {!isLoading && (
                              <ArrowUpOutlined
                                style={{
                                  fontSize: 18,
                                  color: "#ffffff",
                                }}
                              />
                            )}
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Title
                  level={2}
                  className={
                    isMobile
                      ? "!text-2xl !leading-tight text-center"
                      : "!text-4xl md:!text-4xl !leading-[1.2] text-center"
                  }
                  style={{ color: isDark ? C.text : "#1d4ed8" }}
                >
                  <span className="inline-block pb-[2px]">
                    Trợ lí tìm thông tin về sức khỏe
                  </span>
                </Title>

                <div
                  className="!mt-[20px]"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Row
                    gutter={[0, 0]}
                    style={{ width: isMobile ? "100%" : "90%" }}
                  >
                    <Col span={24}>
                      <Card
                        style={{
                          height: isMobile ? "60vh" : "70vh",
                          background: C.pageBg,
                          border: `1px solid ${C.border}`,
                          boxShadow: C.shadow,
                        }}
                        bodyStyle={{
                          padding: 0,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        className="!rounded-3xl"
                      >
                        {/* Chat Messages */}
                        <div
                          ref={messagesContainerRef}
                          style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: isMobile ? "12px" : "20px",
                            background: C.pageBg,
                          }}
                        >
                          {messages.map((msg) => (
                            <div
                              id={`msg-${msg.id}`}
                              key={msg.id}
                              style={{
                                display: "flex",
                                justifyContent:
                                  msg.type === "user"
                                    ? "flex-end"
                                    : "flex-start",
                                marginBottom: "16px",
                                alignItems: "flex-start",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  maxWidth: isMobile ? "85%" : "75%",
                                  background:
                                    typeof msg.content === "string"
                                      ? msg.type === "user"
                                        ? C.bubbleUser
                                        : C.bubbleAI
                                      : "transparent",
                                  color: isDark ? C.text : "#000000",
                                  padding:
                                    typeof msg.content === "string"
                                      ? isMobile
                                        ? "10px 12px"
                                        : "12px 16px"
                                      : 0,
                                  borderRadius:
                                    msg.type === "user"
                                      ? "18px 18px 4px 18px"
                                      : "18px 18px 18px 8px",
                                  border:
                                    typeof msg.content === "string"
                                      ? msg.type === "user"
                                        ? "none"
                                        : `1px solid ${C.border}`
                                      : "none",
                                  boxShadow:
                                    typeof msg.content === "string" &&
                                    msg.type === "user"
                                      ? isDark
                                        ? "0 8px 22px rgba(8,47,73,0.9)"
                                        : "0 8px 18px rgba(37,99,235,0.25)"
                                      : "none",
                                }}
                              >
                                {msg.isLoading ? (
                                  <Space>
                                    <Spin size="small" />
                                    <Text
                                      style={{
                                        color: isDark ? C.textSoft : "#6b7280",
                                      }}
                                    >
                                      AI đang suy nghĩ...
                                    </Text>
                                  </Space>
                                ) : (
                                  <div>
                                    {msg.imageUrl && (
                                      <div style={{ marginBottom: 8 }}>
                                        <Image
                                          src={msg.imageUrl}
                                          alt="uploaded"
                                          style={{
                                            maxWidth: isMobile ? 150 : 200,
                                            maxHeight: isMobile ? 150 : 200,
                                            borderRadius: 8,
                                            objectFit: "cover",
                                            border: `1px solid ${C.border}`,
                                          }}
                                          preview={{
                                            mask: (
                                              <div style={{ color: "white" }}>
                                                Xem ảnh
                                              </div>
                                            ),
                                          }}
                                        />
                                      </div>
                                    )}
                                    {typeof msg.content === "string" ? (
                                      <Paragraph
                                        style={{
                                          margin: 0,
                                          whiteSpace: "pre-wrap",
                                          color:
                                            msg.type === "user"
                                              ? isDark
                                                ? "#f9fafb" // user dark: chữ trắng
                                                : "#0f172a" // user light: tối cho dễ đọc
                                              : isDark
                                              ? C.text
                                              : "#0f172a",
                                          fontSize: isMobile ? "14px" : "15px",
                                        }}
                                      >
                                        {msg.content}
                                      </Paragraph>
                                    ) : (
                                      msg.content
                                    )}

                                    <Text
                                      style={{
                                        fontSize: 13,
                                        opacity: 0.7,
                                        color: isDark ? C.textSoft : "#000",
                                        display: "block",
                                        marginTop: 4,
                                      }}
                                    >
                                      {formatTime(msg.timestamp)}
                                    </Text>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>

                {/* Sticky bottom composer */}
                <div style={{ position: "sticky", bottom: 16, marginTop: 20 }}>
                  {imagePreview && !isLoading && (
                    <div
                      style={{
                        marginBottom: 8,
                        width: isMobile ? "100%" : "90%",
                        margin: "0 auto",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          borderRadius: 16,
                          overflow: "hidden",
                          border: `1px solid ${C.border}`,
                          boxShadow: isDark
                            ? ""
                            : "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Image
                          src={imagePreview}
                          alt="preview"
                          style={{
                            width: isMobile ? 100 : 120,
                            height: isMobile ? 100 : 120,
                            objectFit: "cover",
                            borderRadius: 16,
                          }}
                          preview={{
                            mask: <div style={{ color: "white" }}>Xem ảnh</div>,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            display: "flex",
                            gap: 6,
                          }}
                        >
                          <Button
                            size="small"
                            danger
                            shape="circle"
                            icon={<CloseOutlined />}
                            onClick={clearPickedImage}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: 24,
                      padding: isMobile ? 12 : 15,
                      boxShadow: C.shadow,
                      border: `1px solid ${C.border}`,
                      width: isMobile ? "100%" : "90%",
                      margin: "0 auto",
                    }}
                    className="composer"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <TextArea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                          imageFile
                            ? "Mô tả thêm về triệu chứng/ảnh của bạn..."
                            : "Hãy hỏi tôi về sức khỏe, chuyên khoa, đặt lịch, y tế..."
                        }
                        autoSize={{ minRows: 1, maxRows: 10 }}
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            if (
                              !isLoading &&
                              (inputValue.trim() || imageFile)
                            ) {
                              handleSendMessage(inputValue);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Ctrl+Enter để gửi tin nhắn
                          if (e.ctrlKey && e.key === "Enter") {
                            e.preventDefault();
                            if (
                              !isLoading &&
                              (inputValue.trim() || imageFile)
                            ) {
                              handleSendMessage(inputValue);
                            }
                          }
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: isDark ? C.text : "#111827",
                          paddingTop: 4,
                          fontSize: isMobile ? "16px" : "20px",
                          outline: "none",
                          boxShadow: "none",
                        }}
                        className="!no-scrollbar !mb-2 focus:!outline-none focus:!shadow-none"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Upload
                            beforeUpload={onPickImage}
                            showUploadList={false}
                            accept="image/*"
                          >
                            <Button
                              shape="circle"
                              className="!size-10"
                              icon={<FiPaperclip size={18} />}
                              title="Tải ảnh lên"
                              style={{
                                background: isDark ? C.surface2 : "#fff",
                                color: isDark ? C.text : "",
                              }}
                            />
                          </Upload>
                        </div>
                        <div className="flex items-center gap-3">
                          <Tooltip title="Gửi tin nhắn (Enter hoặc Ctrl+Enter)">
                            <Button
                              shape="circle"
                              loading={isLoading}
                              disabled={
                                isLoading || (!inputValue.trim() && !imageFile)
                              }
                              style={{
                                width: 40,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                                background: isDark ? "#38bdf8" : "#0ea5e9",
                                border: "none",
                              }}
                              onClick={() => handleSendMessage(inputValue)}
                            >
                              {!isLoading && (
                                <ArrowUpOutlined
                                  style={{
                                    fontSize: 18,
                                    color: "#ffffff",
                                  }}
                                />
                              )}
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Content>
        </div>
      </Layout>
    </>
  );
};

export default AIPage;
