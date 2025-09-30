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
  Clock,
  User,
} from "lucide-react";
import { Avatar } from "antd";
import { FaUser } from "react-icons/fa";
import {
  getAllConversationsDoctorAPI,
  getDoctorProfileByUserId,
  getMessagesByConversationIdAPI,
  getPatientDetailBookingById,
} from "../services/doctor.api";
import { useCurrentApp } from "@/components/contexts/app.context";
import { useParams } from "react-router-dom";
import type { IDoctorProfile, IPatientProfile } from "@/types";
import type { IConversation, IConversationDisplay } from "@/types/message";
import { connectMessageSocket } from "@/sockets/message.socket";

const DoctorMessagePage = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataDoctor, setDataDoctor] = useState<IDoctorProfile | null>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] =
    useState<IPatientProfile | null>(null);
  const [displayConversations, setDisplayConversations] = useState<
    IConversationDisplay[]
  >([]);
  const [dataPatient, setDataPatient] = useState<IPatientProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useCurrentApp();
  const socketRef = useRef<ReturnType<typeof connectMessageSocket> | null>(
    null
  );
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationRef = useRef<string | null>(null);
  useEffect(() => {
    currentConversationRef.current = selectedConversation;
  }, [selectedConversation]);

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

  const fetchDoctorAndConversations = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const resDoctor = await getDoctorProfileByUserId(user.id);
        setDataDoctor(resDoctor.data as IDoctorProfile);

        // Sau khi có doctor info → load conversations
        if (resDoctor.data?.id) {
          try {
            const res = await getAllConversationsDoctorAPI(resDoctor.data.id);

            if (res.data) {
              // Load thông tin patient cho mỗi conversation
              if (res.data.conversations && res.data.conversations.length > 0) {
                await loadPatientInfoForConversations(res.data.conversations);
              } else {
                // No conversations found
                setDisplayConversations([]);
              }
            } else {
              // No data returned
              setDisplayConversations([]);
            }
          } catch (conversationError) {
            console.error("❌ Error loading conversations:", conversationError);
            setDisplayConversations([]);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in fetchDoctorAndConversations:", error);
      setDisplayConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      fetchDoctorAndConversations();
    };
    window.addEventListener("doctor:message-refresh", handler);
    return () => window.removeEventListener("doctor:message-refresh", handler);
  }, [fetchDoctorAndConversations]);

  // Effect để scroll xuống cuối khi messages thay đổi (chỉ khi user ở gần cuối)
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  // Effect để xử lý khi có patientId từ URL
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    if (patientId) {
      const fetchPatientProfile = async () => {
        const res = await getPatientDetailBookingById(patientId);
        setDataPatient(res.data as IPatientProfile);
        const resDoctor = await getDoctorProfileByUserId(user?.id as string);
        setDataDoctor(resDoctor.data as IDoctorProfile);
      };

      const checkExistingConversation = async () => {
        try {
          setSelectedConversation(patientId);
        } catch (error) {
          setSelectedConversation(patientId);
        }
      };

      fetchPatientProfile();
      checkExistingConversation();
    } else {
      // Nếu không có patientId → Load doctor info rồi load conversations

      fetchDoctorAndConversations();
    }
  }, [patientId, user?.id]);

  // Function để load thông tin patient cho conversations
  const loadPatientInfoForConversations = async (
    conversations: IConversation[]
  ) => {
    try {
      const conversationsWithPatientInfo: IConversationDisplay[] = [];

      for (const conv of conversations) {
        try {
          // Chỉ hiển thị conversation nếu có ít nhất 1 tin nhắn
          if (!conv.messages || conv.messages.length === 0) {
            console.log(`⏭️ Bỏ qua conversation ${conv.id} - chưa có tin nhắn`);
            continue;
          }

          const patientRes = await getPatientDetailBookingById(conv.patientId);

          if (patientRes.data) {
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

            const displayConv: IConversationDisplay = {
              id: conv.id,
              name: patientRes.data.full_name,
              avatar: patientRes.data.avatar_url || "",
              lastMessage: lastMessage,
              timestamp: timestamp,
              isOnline: true, // Có thể thêm logic để check online status
              unreadCount: 0, // Có thể thêm logic để đếm unread messages
              type: "patient",
              doctorId: dataDoctor?.id || "",
              patientId: conv.patientId,
            };

            conversationsWithPatientInfo.push(displayConv);
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý conversation:", error);
        }
      }

      setDisplayConversations(conversationsWithPatientInfo);
    } catch (error) {
      console.error("❌ Error loading patient info for conversations:", error);
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
        senderId: msg.senderId,
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

  // Lọc conversations theo search query
  const filteredConversations = displayConversations.filter(
    (conv) =>
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

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
    if (user?.id && user?.userType === "DOCTOR") {
      socket.emit("join-message-room", { userId: user?.id });
    }

    // 📨 Listen cho tin nhắn được gửi thành công
    socket.on("message-sent", async (message) => {
      // Xác định isOwn dựa trên senderId
      const isOwn = message.senderId === user?.id;

      // Chỉ append vào khung chat nếu đúng hội thoại đang mở
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

      // Nếu đang trong conversation này, auto join room
      if (message.conversationId && selectedConversation) {
        socket.emit("join-conversation", {
          conversationId: message.conversationId,
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

            return prev.map((conv) =>
              conv.id.toString() === message.conversationId.toString()
                ? {
                    ...conv,
                    lastMessage: formattedLastMessage,
                    timestamp: message.timestamp,
                  }
                : conv
            );
          } else if (!isOwn) {
            // Nếu chưa có conversation này và là tin nhắn từ patient, trigger reload
            // Trigger reload bằng cách set flag
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("reloadConversations"));
            }, 1000);
            return prev;
          }
          return prev;
        });
      }
    });

    // 🔔 Cập nhật preview sidebar từ server (cả khi đang chat nơi khác)
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
        // Move to top
        const picked = updated.find((c) => c.id.toString() === targetId)!;
        const others = updated.filter((c) => c.id.toString() !== targetId);
        return [picked, ...others];
      });
      if (needFetch) void fetchDoctorAndConversations();
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

  // Effect để handle reload conversations khi có tin nhắn mới từ patient
  useEffect(() => {
    const handleReloadConversations = async () => {
      if (dataDoctor?.id) {
        try {
          const res = await getAllConversationsDoctorAPI(dataDoctor.id);
          if (res.data?.conversations) {
            await loadPatientInfoForConversations(res.data.conversations);
          }
        } catch (error) {
          console.error("❌ Lỗi reload conversations:", error);
        }
      }
    };

    window.addEventListener("reloadConversations", handleReloadConversations);

    return () => {
      window.removeEventListener(
        "reloadConversations",
        handleReloadConversations
      );
    };
  }, [dataDoctor?.id]);

  const handleSendMessage = () => {
    if (messageInput.trim() && socketRef.current) {
      // Lấy patientId từ URL hoặc từ conversation đã chọn
      const currentPatientId = patientId || selectedPatientInfo?.id;

      socketRef.current.emit("send-message", {
        senderId: user?.id, // Sử dụng user?.id thay vì dataDoctor?.userId
        patientId: currentPatientId,
        doctorId: dataDoctor?.id,
        senderType: "DOCTOR",
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

  // Early return nếu không có user
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg h-[600px] md:h-[700px] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-600 mb-2">
                Đang tải thông tin người dùng...
              </h2>
              <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg h-[700px] md:h-[800px] flex overflow-hidden">
          {/* Sidebar - Danh sách bệnh nhân */}
          <div
            className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
              selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header sidebar */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                  Tin nhắn bệnh nhân
                </h1>
              </div>

              {/* Thanh tìm kiếm */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Danh sách bệnh nhân */}
            <div className="flex-1 overflow-y-auto">
              {/* Hiển thị patient conversation khi có patientId */}
              {patientId && dataPatient && (
                <div
                  onClick={() => setSelectedConversation(patientId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === patientId
                      ? "bg-blue-50 border-r-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar
                        size={48}
                        {...(dataPatient.avatar_url && {
                          src: dataPatient.avatar_url,
                        })}
                        icon={<FaUser />}
                        style={{ backgroundColor: "#f0f0f0" }}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate flex items-center">
                          <User className="w-4 h-4 mr-1 text-gray-500" />
                          {dataPatient.full_name}
                        </h3>
                        <span className="text-xs text-gray-500">Vừa xong</span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          Bắt đầu cuộc trò chuyện với bệnh nhân
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Bệnh nhân
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Đang tư vấn
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách conversations khác nếu không có patientId */}
              {!patientId &&
                filteredConversations &&
                filteredConversations.length > 0 &&
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={async () => {
                      setSelectedConversation(conv.id.toString());
                      loadMessages(conv.id.toString());

                      // Load thông tin patient để hiển thị trong header
                      try {
                        const patientRes = await getPatientDetailBookingById(
                          conv.patientId || ""
                        );
                        if (patientRes.data) {
                          setSelectedPatientInfo(patientRes.data);
                        }
                      } catch (error) {
                        console.error("Error loading patient info:", error);
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
                        <Avatar
                          size={48}
                          {...(conv.avatar && {
                            src: conv.avatar,
                          })}
                          icon={<FaUser />}
                        />
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-500" />
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
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Bệnh nhân
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            Tư vấn trực tuyến
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Hiển thị loading */}
              {loading && (
                <div className="p-4 text-center text-gray-500">
                  <p>Đang tải...</p>
                </div>
              )}

              {/* Hiển thị message khi không có conversations */}
              {!loading && !patientId && filteredConversations.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p>Chưa có cuộc trò chuyện nào</p>
                  <p className="text-sm mt-1">
                    Bệnh nhân sẽ xuất hiện ở đây khi họ liên hệ tư vấn
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
                        <Avatar
                          size={40}
                          {...(dataPatient?.avatar_url && {
                            src: dataPatient.avatar_url,
                          })}
                          icon={<FaUser />}
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>

                      <div>
                        <h2 className="font-medium text-gray-900">
                          {(selectedPatientInfo || dataPatient)?.full_name}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            Đang hoạt động
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-blue-600">
                            Tư vấn trực tuyến
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
                        Bạn đang tư vấn cho bệnh nhân{" "}
                        {(selectedPatientInfo || dataPatient)?.full_name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Hãy lắng nghe và đưa ra lời khuyên y khoa phù hợp
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

                {/* Thanh nhập tin nhắn */}
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
                        placeholder="Nhập tin nhắn cho bệnh nhân..."
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
              // Màn hình chào mừng khi chưa chọn bệnh nhân
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-600 mb-2">
                    Tư vấn và hỗ trợ bệnh nhân
                  </h2>
                  <p className="text-gray-500">
                    Chọn một bệnh nhân để bắt đầu trò chuyện và tư vấn y tế
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessagePage;
