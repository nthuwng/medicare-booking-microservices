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
  UserOutlined,
  SettingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { chatWithAIAPI } from "../services/client.api";
import ClientHeader from "@/components/layout/ClientLayout/ClientHeader";
import { FiPaperclip } from "react-icons/fi";
import IntentRenderer from "../components/AI/IntentRender";
import { Link, useNavigate } from "react-router-dom";

const { Content } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  imageUrl?: string;
}

const AIPage = () => {
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

  // Cuộn tới 1 message cụ thể (khi bạn vừa gửi)
  const scrollToMessage = (id: string) => {
    const c = messagesContainerRef.current;
    const el = document.getElementById(`msg-${id}`);
    if (c && el) {
      const top = el.offsetTop - c.offsetTop; // vị trí của message trong container
      c.scrollTo({ top, behavior: "smooth" });
    } else {
      el?.scrollIntoView({ behavior: "smooth", block: "end" }); // fallback
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

    // Hiển thị message của user (kèm ảnh preview nếu có)
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
    // cuộn tới bubble user vừa thêm
    setTimeout(() => {
      scrollToMessage(userMessage.id);
    }, 0);

    try {
      let aiText = "";
      let displayContent: string | React.ReactNode = ""; // Biến mới để chứa nội dung hiển thị

      const res = await chatWithAIAPI(imageFile || new File([], ""), trimmed);

      if (res?.intent === "recommend_specialty_text") {
        // *** Thay vì chỉ gọi component, ta gán component này vào displayContent ***
        displayContent = (
          <IntentRenderer
            intent={res?.intent}
            text={res?.text}
            data={res?.data}
          />
        );
      } else {
        // Nếu không phải intent đặc biệt, vẫn hiển thị text thông thường
        aiText = res?.text ?? "Tôi không thể xử lí yêu cầu này.";
        displayContent = aiText;
      }

      // *** Cập nhật content của aiMessage bằng displayContent (string hoặc JSX) ***
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessage.id
            ? { ...m, content: displayContent as string, isLoading: false }
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
                  "Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
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
    console.log("messages <><><>>", messages);
  }, [messages]);

  useEffect(() => {
    if (hasStarted) setTimeout(scrollToBottom, 0);
  }, [hasStarted]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Page-scoped styles */}
      <style>{`
        .ai-chat-page .composer textarea::placeholder {
          color: #ffffff !important;
          opacity: 1;
        }
      `}</style>
      <Layout
        style={{
          minHeight: "100vh",
          background: "#F4F4F9",
        }}
        className="!flex  !flex-row ai-chat-page"
      >
        <div style={{ width: isSidebarCollapsed ? 64 : "15%" }}>
          <div
            className="text-2xl font-bold text-blue-600 cursor-pointer text-center"
            style={{ padding: 12 }}
          >
            <Link to="/">
              <span className="text-blue-800">Medi</span>Care
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 12,
              height: "calc(100vh - 70px)",
              position: "sticky",
              top: 70,
              alignItems: isSidebarCollapsed ? "center" : "stretch",
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
              style={{ width: isSidebarCollapsed ? 40 : "100%" }}
            >
              {!isSidebarCollapsed && "Thu gọn"}
            </Button>
            <Button
              type="primary"
              style={{ width: isSidebarCollapsed ? 40 : "100%" }}
              icon={<PlusOutlined />}
              onClick={handleNewChat}
            >
              {!isSidebarCollapsed && "New chat"}
            </Button>
            <div
              style={{
                fontWeight: 600,
                color: "#374151",
                marginTop: 8,
                display: isSidebarCollapsed ? "none" : "block",
              }}
            >
              Menu
            </div>
            <Button
              style={{ width: isSidebarCollapsed ? 40 : "100%" }}
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              {!isSidebarCollapsed && "Trang chủ"}
            </Button>
          </div>
        </div>
        <div style={{ flex: "1 1 auto" }}>
          <Content
            style={{
              padding: "24px",
              position: "relative",
              marginTop: "70px",
              zIndex: 1,
              margin: "0 auto",
            }}
          >
            {/* Landing hero (pre-chat) */}
            {!hasStarted ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "95vh",
                  flexDirection: "column",
                  gap: 24,
                }}
              >
                <Title
                  level={2}
                  className="!text-4xl md:!text-4xl !leading-[1.2]"
                >
                  <span
                    className="inline-block pb-[2px]
                 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-400
                 bg-clip-text text-transparent"
                  >
                    Trợ lí tìm thông tin về sức khỏe
                  </span>
                </Title>
                <Paragraph className="!text-stone-600 !text-base md:!text-lg !text-center !max-w-3xl">
                  Hỏi đáp y tế, gợi ý chuyên khoa, đặt lịch khám và hơn thế nữa.
                  Bạn có thể mô tả triệu chứng hoặc tải ảnh để nhận tư vấn chính
                  xác hơn.
                </Paragraph>
                <div
                  style={{
                    width: "min(900px, 95%)",
                    background: "#ffffff",
                    borderRadius: 24,
                    padding: 12,
                    border: "1px solid #e7e5e4",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
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
                            border: "1px solid #e7e5e4",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Image
                            src={imagePreview}
                            alt="preview"
                            style={{
                              width: 120,
                              height: 120,
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
                        color: "#111827",
                        paddingTop: 4,
                        fontSize: "20px",
                        outline: "none",
                        boxShadow: "none",
                      }}
                      className="!no-scrollbar !mb-2 focus:!outline-none focus:!shadow-none"
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
                            className="!size-10 hover:!bg-gray-100"
                            title="Tải ảnh lên"
                          />
                        </Upload>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tooltip title="Gửi tin nhắn (Enter hoặc Ctrl+Enter)">
                          <Button
                            shape="circle"
                            icon={<ArrowUpOutlined />}
                            onClick={() => handleSendMessage(inputValue)}
                            loading={isLoading}
                            disabled={
                              isLoading || (!inputValue.trim() && !imageFile)
                            }
                            className="!size-10 hover:!bg-gray-100"
                          />
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
                  className="!text-4xl md:!text-4xl !leading-[1.2] text-center"
                >
                  <span
                    className="inline-block pb-[2px]
                 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-400
                 bg-clip-text text-transparent"
                  >
                    Trợ lí tìm thông tin về sức khỏe
                  </span>
                </Title>
                <div
                  className="!mt-[20px]"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Row gutter={[0, 0]} style={{ width: "90%" }}>
                    <Col span={24}>
                      <Card
                        style={{
                          height: "70vh",
                          // background: "rgba(250, 250, 249, 0.95)",
                          // backdropFilter: "blur(10px)",
                          border: "none",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                        bodyStyle={{
                          padding: 0,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        className="rounded-2xl"
                      >
                        {/* Chat Messages */}
                        <div
                          ref={messagesContainerRef}
                          style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "20px",
                            // background: "#EEEEEE",
                          }}
                        >
                          {messages.map((msg) => (
                            <>
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
                                    maxWidth: "75%",
                                    background:
                                      msg.type === "user"
                                        ? "#ffffff"
                                        : "#ffffff",
                                    color:
                                      msg.type === "user" ? "black" : "#000000",
                                    padding: "12px 16px",
                                    borderRadius:
                                      msg.type === "user"
                                        ? "18px 18px 4px 18px"
                                        : "18px 18px 18px 8px",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",

                                    border: "1px solid #e7e5e4",
                                  }}
                                >
                                  {msg.isLoading ? (
                                    <Space>
                                      <Spin size="small" />
                                      <Text
                                        style={{
                                          color:
                                            msg.type === "user"
                                              ? "white"
                                              : "#6b7280",
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
                                              maxWidth: 200,
                                              maxHeight: 200,
                                              borderRadius: 8,
                                              objectFit: "cover",
                                              border:
                                                "1px solid rgba(255,255,255,0.2)",
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
                                      {msg.content && (
                                        <Paragraph
                                          style={{
                                            margin: 0,
                                            whiteSpace: "pre-wrap",
                                            color:
                                              msg.type === "user"
                                                ? "#000000"
                                                : "#000000",
                                            fontSize: "15px",
                                          }}
                                        >
                                          {msg.content}
                                        </Paragraph>
                                      )}
                                      <Text
                                        style={{
                                          fontSize: "13px",
                                          opacity: 0.7,
                                          color:
                                            msg.type === "user"
                                              ? "#000000"
                                              : "#000000",
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
                            </>
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
                    <div style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "1px solid #e7e5e4",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Image
                          src={imagePreview}
                          alt="preview"
                          style={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
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
                      background: "#303030",
                      borderRadius: 24,
                      padding: 15,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                      width: "90%",
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
                          color: "#ffffff",
                          paddingTop: 4,
                          fontSize: "20px",
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
                              className="!size-10 hover:!bg-gray-100"
                              icon={<FiPaperclip size={18} />}
                              title="Tải ảnh lên"
                            />
                          </Upload>
                        </div>
                        <div className="flex items-center gap-3">
                          <Tooltip title="Gửi tin nhắn (Enter hoặc Ctrl+Enter)">
                            <Button
                              shape="circle"
                              icon={<ArrowUpOutlined />}
                              onClick={() => handleSendMessage(inputValue)}
                              loading={isLoading}
                              disabled={
                                isLoading || (!inputValue.trim() && !imageFile)
                              }
                              className="!size-10 hover:!text-blue-500 hover:!bg-white !text-black !bg-white hover:!border-blue-500"
                            />
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
