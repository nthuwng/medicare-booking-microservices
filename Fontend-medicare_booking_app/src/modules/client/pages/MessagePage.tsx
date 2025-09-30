import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { useCurrentApp } from "@/components/contexts/app.context";

import { useParams } from "react-router-dom";
import type { IDoctorProfile, IPatientProfile } from "@/types";
import {
  getDoctorDetailBookingById,
  getMessagesByConversationIdAPI,
  getPatientByUserIdAPI,
  getAllConversationsPatientAPI,
} from "../services/client.api";
import type { IConversation, IConversationDisplay } from "@/types/message";
import { connectMessageSocket } from "@/sockets/message.socket";

// Function để chuyển đổi ký hiệu thành tên đầy đủ
const getTitleFullName = (titleCode: string) => {
  const titleMap: { [key: string]: string } = {
    GS: "Giáo sư",
    PGS: "Phó Giáo sư",
    TS: "Tiến sĩ",
    ThS: "Thạc sĩ",
    BS: "Bác sĩ",
  };

  return titleMap[titleCode] || titleCode;
};

const MessagePage = () => {
  const { doctorId } = useParams<{ doctorId?: string }>();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataDoctor, setDataDoctor] = useState<IDoctorProfile | null>(null);
  const [selectedDoctorInfo, setSelectedDoctorInfo] =
    useState<IDoctorProfile | null>(null);
  const [displayConversations, setDisplayConversations] = useState<
    IConversationDisplay[]
  >([]);
  const [dataPatient, setDataPatient] = useState<IPatientProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const { user } = useCurrentApp();
  const socketRef = useRef<ReturnType<typeof connectMessageSocket> | null>(
    null
  );
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    currentConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const scheduleRefreshConversations = () => {
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(async () => {
      try {
        const patientIdToUse =
          dataPatient?.id ||
          (await (async () => {
            if (!user?.id) return null;
            const resPatient = await getPatientByUserIdAPI(user.id);
            setDataPatient(resPatient.data as IPatientProfile);
            return resPatient.data?.id as string | null;
          })());
        if (patientIdToUse) {
          const res = await getAllConversationsPatientAPI(patientIdToUse);
          if (res.data?.conversations)
            await loadDoctorInfoForConversations(res.data.conversations);
        }
      } catch (e) {
        // ignore
      } finally {
        refreshTimerRef.current = null;
      }
    }, 250);
  };

  // Function để scroll xuống cuối (chỉ trong container tin nhắn)
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Function để check user có đang ở gần cuối không
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 100; // 100px từ cuối
    return (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold
    );
  };

  // Effect để scroll xuống cuối khi messages thay đổi (chỉ khi user ở gần cuối)
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  // Effect để xử lý khi có doctorId từ URL
  useEffect(() => {
    if (doctorId) {
      const fetchDoctorProfile = async () => {
        const res = await getDoctorDetailBookingById(doctorId);
        setDataDoctor(res.data as IDoctorProfile);
        const resPatient = await getPatientByUserIdAPI(user?.id as string);
        setDataPatient(resPatient.data as IPatientProfile);
      };

      const checkExistingConversation = async () => {
        try {
          // Chỉ kiểm tra xem có conversation có sẵn không, KHÔNG tạo mới
          const res = await getAllConversationsPatientAPI(doctorId);

          if (res.data) {
            // Conversation đã tồn tại → Load lịch sử
            setSelectedConversation(doctorId);
            loadMessages(res.data.conversations[0].id.toString());
          } else {
            // Chưa có conversation → Chỉ set selectedConversation để hiện UI
            setSelectedConversation(doctorId);
          }
        } catch (error) {
          // Chưa có conversation → Chỉ hiển thị UI trống
          setSelectedConversation(doctorId);
        }
      };

      fetchDoctorProfile();
      checkExistingConversation();
    } else {
      // Nếu không có doctorId → Load patient info rồi load conversations
      const fetchPatientAndConversations = async () => {
        try {
          if (user?.id) {
            const resPatient = await getPatientByUserIdAPI(user.id);
            setDataPatient(resPatient.data as IPatientProfile);

            // Sau khi có patient info → load conversations
            if (resPatient.data?.id) {
              const res = await getAllConversationsPatientAPI(
                resPatient.data.id
              );

              if (res.data) {
                // Load thông tin doctor cho mỗi conversation
                if (
                  res.data.conversations &&
                  res.data.conversations.length > 0
                ) {
                  await loadDoctorInfoForConversations(res.data.conversations);
                } else {
                }
              }
            }
          }
        } catch (error) {
          console.error("❌ Error in fetchPatientAndConversations:", error);
        }
      };

      fetchPatientAndConversations();
    }
  }, [doctorId]);

  // Function để load thông tin doctor cho conversations
  const loadDoctorInfoForConversations = async (
    conversations: IConversation[]
  ) => {
    try {
      const conversationsWithDoctorInfo: IConversationDisplay[] = [];

      for (const conv of conversations) {
        try {
          // Chỉ hiển thị conversation nếu có ít nhất 1 tin nhắn
          if (!conv.messages || conv.messages.length === 0) {
            console.log(`⏭️ Bỏ qua conversation ${conv.id} - chưa có tin nhắn`);
            continue;
          }

          const doctorRes = await getDoctorDetailBookingById(conv.doctorId);

          if (doctorRes.data) {
            // Format tin nhắn cuối cùng dựa trên người gửi
            const lastMessageData = conv.messages[0];
            const isOwnMessage = lastMessageData.senderId === user?.id;
            const lastMessage = isOwnMessage
              ? `Bạn: ${lastMessageData.content}`
              : lastMessageData.content;

            const timestamp = new Date(
              lastMessageData.createdAt
            ).toLocaleTimeString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            });

            const displayConv = {
              id: conv.id,
              name: `${doctorRes.data.title} ${doctorRes.data.fullName}`,
              avatar:
                doctorRes.data.avatarUrl ||
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
              lastMessage: lastMessage,
              timestamp: timestamp,
              isOnline: true, // Có thể thêm logic để check online status
              unreadCount: 0, // Có thể thêm logic để đếm unread messages
              type: "doctor",
              doctorId: conv.doctorId,
            };

            conversationsWithDoctorInfo.push(displayConv);
          }
        } catch (error) {}
      }

      setDisplayConversations(conversationsWithDoctorInfo);
    } catch (error) {
      console.error("❌ Error loading doctor info for conversations:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const res = await getMessagesByConversationIdAPI(conversationId);
    if (res.data) {
      const formattedMessages = res.data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: msg.senderId === user?.id, // So sánh senderId từ DB với user.id
        conversationId: msg.conversationId,
        senderId: msg.senderId, // Debug thêm senderId
      }));

      setMessages(formattedMessages);

      // Join conversation room khi load messages
      if (socketRef.current) {
        socketRef.current.emit("join-conversation", {
          conversationId: conversationId,
        });
      }

      // Auto scroll xuống cuối khi load conversation mới
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  useEffect(() => {
    // Cleanup previous socket if exists
    if (socketRef.current) {
      socketRef.current.off("message-sent");
      socketRef.current.off("message-error");
      socketRef.current.disconnect();
    }

    const socket = connectMessageSocket();
    socketRef.current = socket;

    // Join user room
    if (user?.id && user?.userType === "PATIENT") {
      socket.emit("join-message-room", { userId: user?.id });
    }

    // 📨 Listen cho tin nhắn được gửi thành công
    socket.on("message-sent", (message) => {
      // Xác định isOwn dựa trên senderId
      const isOwn = message.senderId === user?.id;

      // Chỉ append nếu là hội thoại đang mở
      const isCurrent =
        message.conversationId?.toString() ===
        currentConversationRef.current?.toString();
      if (isCurrent) {
        setMessages((prev) => {
          const exists = prev.find((msg) => msg.id === message.id);
          if (exists) return prev;
          return [...prev, { ...message, isOwn }];
        });
      }

      // Cập nhật danh sách conversation khi có tin nhắn mới
      if (message.conversationId) {
        setDisplayConversations((prev) => {
          const existingConv = prev.find(
            (conv) => conv.id.toString() === message.conversationId.toString()
          );
          if (existingConv) {
            // Cập nhật last message và timestamp cho conversation hiện có
            // Format tin nhắn dựa trên người gửi
            const formattedLastMessage = isOwn
              ? `Bạn: ${message.content}`
              : message.content;

            const updated = prev.map((conv) =>
              conv.id.toString() === message.conversationId.toString()
                ? {
                    ...conv,
                    lastMessage: formattedLastMessage,
                    timestamp: message.timestamp,
                  }
                : conv
            );
            // move to top
            const picked = updated.find(
              (c) => c.id.toString() === message.conversationId.toString()
            )!;
            const others = updated.filter(
              (c) => c.id.toString() !== message.conversationId.toString()
            );
            return [picked, ...others];
          }
          return prev;
        });
      }
    });

    // Sidebar preview updates from server for this user
    socket.on("conversation-updated", (payload: any) => {
      let needFetch = false;
      setDisplayConversations((prev) => {
        const targetId = payload.conversationId?.toString();
        const exists = prev.find((c) => c.id.toString() === targetId);
        const last =
          payload.senderId === user?.id
            ? `Bạn: ${payload.lastMessage}`
            : payload.lastMessage;
        if (!exists) {
          needFetch = true;
          return prev;
        }
        const updated = prev.map((c) =>
          c.id.toString() === targetId
            ? {
                ...c,
                lastMessage: last,
                timestamp: new Date(payload.createdAt).toLocaleTimeString(
                  "vi-VN",
                  {
                    timeZone: "Asia/Ho_Chi_Minh",
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                ),
              }
            : c
        );
        const picked = updated.find((c) => c.id.toString() === targetId)!;
        const others = updated.filter((c) => c.id.toString() !== targetId);
        return [picked, ...others];
      });
      if (needFetch) scheduleRefreshConversations();
    });

    // Listen for errors
    socket.on("message-error", (error) => {
      console.error("Message error:", error);
    });

    return () => {
      socket.off("message-sent");
      socket.off("conversation-updated");
      socket.off("message-error");
      socket.disconnect();
    };
  }, [user?.id]);

  // Effect để join conversation room khi chọn conversation
  useEffect(() => {
    if (selectedConversation && socketRef.current) {
      socketRef.current.emit("join-conversation", {
        conversationId: selectedConversation,
      });
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (messageInput.trim() && socketRef.current) {
      // Lấy doctorId từ URL hoặc từ conversation đã chọn
      const currentDoctorId = doctorId || selectedDoctorInfo?.id;

      socketRef.current.emit("send-message", {
        senderId: user?.id, // Sử dụng user?.id thay vì dataPatient?.user_id
        patientId: dataPatient?.id,
        doctorId: currentDoctorId,
        senderType: "PATIENT",
        content: messageInput.trim(),
        messageType: "TEXT",
      });

      setMessageInput(""); // Clear input

      // Scroll xuống cuối khi gửi tin nhắn
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Tin nhắn</h1>
        <p className="text-gray-600">Trao đổi với bác sĩ và nhận tư vấn y tế</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg h-[600px] md:h-[700px] flex overflow-hidden">
        {/* Sidebar - Danh sách cuộc trò chuyện */}
        <div
          className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header sidebar */}
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                Tin nhắn
              </h1>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Danh sách cuộc trò chuyện */}
          <div className="flex-1 overflow-y-auto">
            {/* Hiển thị doctor conversation khi có doctorId */}
            {doctorId && dataDoctor && (
              <div
                onClick={() => setSelectedConversation(doctorId)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === doctorId
                    ? "bg-blue-50 border-r-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={
                        dataDoctor.avatarUrl ||
                        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150"
                      }
                      alt={dataDoctor.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {dataDoctor.title} {dataDoctor.fullName}
                      </h3>
                      <span className="text-xs text-gray-500">Vừa xong</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        Bắt đầu cuộc trò chuyện với bác sĩ
                      </p>
                    </div>

                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Bác sĩ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danh sách conversations khác nếu không có doctorId */}
            {!doctorId &&
              displayConversations &&
              displayConversations.length > 0 &&
              displayConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={async () => {
                    setSelectedConversation(conv.id.toString());
                    loadMessages(conv.id.toString());

                    // Load thông tin doctor để hiển thị trong header
                    try {
                      const doctorRes = await getDoctorDetailBookingById(
                        conv.doctorId
                      );
                      if (doctorRes.data) {
                        setSelectedDoctorInfo(doctorRes.data);
                      }
                    } catch (error) {
                      console.error("Error loading doctor info:", error);
                    }
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conv.id.toString()
                      ? "bg-blue-50 border-r-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conv.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conv.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}
                        >
                          {getTitleFullName(conv.name.split(" ")[0])}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* Hiển thị message khi không có conversations */}
            {!doctorId && displayConversations.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>Chưa có cuộc trò chuyện nào</p>
                <p className="text-sm mt-1">
                  Hãy đặt lịch khám với bác sĩ để bắt đầu tư vấn
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Khu vực chat chính */}
        <div
          className={`flex-1 flex flex-col ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Header chat */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                      <img
                        src={
                          (selectedDoctorInfo || dataDoctor)?.avatarUrl ||
                          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150"
                        }
                        alt={(selectedDoctorInfo || dataDoctor)?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <div>
                      <h2 className="font-medium text-gray-900">
                        {(selectedDoctorInfo || dataDoctor)?.title}{" "}
                        {(selectedDoctorInfo || dataDoctor)?.fullName}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">Đang hoạt động</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-blue-600">
                          {
                            (selectedDoctorInfo || dataDoctor)?.specialty
                              ?.specialtyName
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Khu vực tin nhắn */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              >
                {/* Tin nhắn chào mừng */}
                <div className="flex justify-center">
                  <div className="bg-blue-100 px-4 py-2 rounded-lg text-center max-w-md">
                    <p className="text-sm text-blue-800">
                      Bạn đã bắt đầu cuộc trò chuyện với{" "}
                      {(selectedDoctorInfo || dataDoctor)?.title}{" "}
                      {(selectedDoctorInfo || dataDoctor)?.fullName}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Hãy mô tả triệu chứng hoặc đặt câu hỏi để được tư vấn
                    </p>
                  </div>
                </div>

                {/* Hiển thị tin nhắn real-time */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isOwn ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Nhập tin nhắn..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-gray-500">Chọn cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
