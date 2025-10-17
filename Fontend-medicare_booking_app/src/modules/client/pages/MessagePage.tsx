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

import { useLocation, useParams } from "react-router-dom";
import type { IDoctorProfile } from "@/types";
import type { IConversation, ILastMessage } from "@/types/message";
import { useCurrentApp } from "@/components/contexts/app.context";
import {
  connectMessageSocket,
  joinConversationRoom,
  joinUserRoom,
  offConversationUpdated,
  offMessageNew,
  onConversationUpdated,
  onMessageNew,
  sendMessage,
} from "@/sockets/message.socket";
import type { Socket } from "socket.io-client";
import {
  getAllConversationsPatientAPI,
  getDoctorDetailBookingById,
  getMessagesByConversationIdAPI,
  getPatientByUserIdAPI,
} from "../services/client.api";
import {
  getUnreadCountMessageAPI,
  markMessagesAsReadAPI,
} from "../services/client.api";
import { Avatar } from "antd";

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

type NavState = { doctorId?: string };

const MessagePage = () => {
  // const { doctorId } = useParams<{ doctorId?: string }>();

  const location = useLocation();
  const { doctorId } = (location.state as NavState) || {};

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataDoctor, setDataDoctor] = useState<IDoctorProfile | null>(null);

  const [displayConversations, setDisplayConversations] = useState<
    IConversation[]
  >([]);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { user } = useCurrentApp();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [patientIdState, setPatientIdState] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  // map convId -> unread count
  const [unreadByConv, setUnreadByConv] = useState<Record<number, number>>({});
  // thêm dưới các useState hiện có
  const didAutoOpenRef = useRef(false); // chặn auto-open lặp lại
  const currentConvIdRef = useRef<number | null>(null); // giữ convId hiện tại cho socket
  useEffect(() => {
    currentConvIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const fetchDoctorDetailBooking = async () => {
    if (!doctorId) return;
    const res = await getDoctorDetailBookingById(String(doctorId));
    setDataDoctor(res.data as IDoctorProfile);
  };

  const fetchPatientProfile = async () => {
    const patient = await getPatientByUserIdAPI(user?.id || "");
    const pid = patient.data?.id;
    if (pid) setPatientIdState(pid);
    return pid;
  };

  const fetchAllConversationsPatient = async () => {
    const pid = (await fetchPatientProfile()) || "";
    const res = await getAllConversationsPatientAPI(pid);
    setDisplayConversations(res?.data?.conversations ?? []);
    // load unread counts
    if (user?.id) {
      try {
        const unread = await getUnreadCountMessageAPI(user.id);
        const map: Record<number, number> = {};
        (unread.data?.byConversation || []).forEach((it: any) => {
          map[it.conversationId] = it.count;
        });
        setUnreadByConv(map);
      } catch {}
    }
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 100;
    return (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold
    );
  };

  const loadMessages = async (conversationId: string) => {
    const res = await getMessagesByConversationIdAPI(conversationId);
    if (res.data) {
      const formatted = res.data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: msg.senderId === user?.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
      }));
      setMessages(formatted);
      setTimeout(scrollToBottom, 100);
    }
  };

  // connect socket + fetch data
  useEffect(() => {
    const s = connectMessageSocket();
    setSocket(s);
    fetchDoctorDetailBooking();
    fetchAllConversationsPatient();
  }, [user]);

  // join user room
  useEffect(() => {
    if (!socket || !user?.id) return;
    joinUserRoom(socket, user.id);
  }, [socket, user?.id]);

  // join conversation room when selecting
  useEffect(() => {
    if (!socket || !selectedConversationId) return;
    joinConversationRoom(socket, Number(selectedConversationId), user?.id);
    // mark read when opening a conversation
    if (user?.id) {
      markMessagesAsReadAPI(Number(selectedConversationId), user.id).finally(
        () => {
          setUnreadByConv((prev) => ({
            ...prev,
            [Number(selectedConversationId)]: 0,
          }));
        }
      );
    }
  }, [socket, selectedConversationId, user?.id]);

  // auto open conv by doctorId if exists
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (!doctorId || displayConversations.length === 0) return;

    const found = displayConversations.find((c) => c.doctorId === doctorId);
    if (!found) return;

    didAutoOpenRef.current = true; // khóa auto-open
    setSelectedConversationId(found.id);
    loadMessages(String(found.id));
    if (socket && user?.id) joinConversationRoom(socket, found.id, user.id);

    // đồng bộ header bác sĩ
    getDoctorDetailBookingById(found.doctorId)
      .then((res) => res?.data && setDataDoctor(res.data as any))
      .catch(() => {});
    // chú ý deps: KHÔNG đưa socket/user vào để tránh re-run
  }, [doctorId, displayConversations]);

  // message:new
  useEffect(() => {
    if (!socket) return;
    const handleNew = (msg: any) => {
      const isCurrent =
        String(msg.conversationId) === String(selectedConversationId);
      if (isCurrent) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id,
              content: msg.content,
              timestamp: msg.timestamp,
              isOwn: msg.senderId === user?.id,
              conversationId: msg.conversationId,
              senderId: msg.senderId,
            },
          ];
        });
        // mark read immediately when viewing this conversation
        if (user?.id) {
          markMessagesAsReadAPI(Number(msg.conversationId), user.id);
        }
      } else {
        // increase unread for that conversation if message from other
        if (msg.senderId !== user?.id) {
          setUnreadByConv((prev) => ({
            ...prev,
            [Number(msg.conversationId)]:
              (prev[Number(msg.conversationId)] || 0) + 1,
          }));
        }
      }
    };
    onMessageNew(socket, handleNew);
    return () => offMessageNew(socket, handleNew);
  }, [socket, selectedConversationId, user?.id]);

  // conversation:updated for sidebar
  useEffect(() => {
    if (!socket) return;
    const handleConvUpdated = (payload: {
      conversationId: number;
      lastMessage: ILastMessage;
      lastMessageAt: string;
    }) => {
      setDisplayConversations((prev) => {
        const existed = prev.find((c) => c.id === payload.conversationId);

        if (existed) {
          const next = prev.map((c) =>
            c.id === payload.conversationId
              ? {
                  ...c,
                  lastMessage: payload.lastMessage,
                  lastMessageAt: payload.lastMessageAt,
                }
              : c
          );
          return next.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          );
        } else {
          // chưa có conv → cần fetch thêm thông tin bác sĩ rồi push vào
          // (vì backend chỉ emit conversationId, không kèm full info)

          fetchAllConversationsPatient();
          return prev;
        }
      });

      // tăng badge chưa đọc nếu tin nhắn đến từ người khác và không ở cuộc trò chuyện hiện tại
      const isFromMe = payload.lastMessage?.senderId === user?.id;
      const isCurrent =
        String(payload.conversationId) === String(selectedConversationId);
      if (!isFromMe && !isCurrent) {
        setUnreadByConv((prev) => ({
          ...prev,
          [Number(payload.conversationId)]:
            (prev[Number(payload.conversationId)] || 0) + 1,
        }));
      }
    };
    onConversationUpdated(socket, handleConvUpdated);
    return () => offConversationUpdated(socket, handleConvUpdated);
  }, [socket, doctorId, dataDoctor, selectedConversationId, user?.id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !socket || !user?.id) return;

    const base = {
      senderId: user.id,
      senderType: "PATIENT" as const,
      content: messageInput.trim(),
      messageType: "TEXT" as const,
    };

    let ack;
    if (selectedConversationId) {
      ack = await sendMessage(socket, {
        ...base,
        conversationId: selectedConversationId,
      });
    } else {
      if (!patientIdState || !doctorId) return;
      ack = await sendMessage(socket, {
        ...base,
        patientId: patientIdState,
        doctorId,
      });
    }

    if (!ack?.ok) {
      console.error("Send failed:", ack?.error);
      return;
    }

    if (!selectedConversationId && ack.conversationId) {
      setSelectedConversationId(ack.conversationId);
      if (socket && user?.id)
        joinConversationRoom(socket, ack.conversationId, user.id);

      await loadMessages(String(ack.conversationId));
    }

    setMessageInput("");
    setTimeout(scrollToBottom, 50);
  };

  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [messages]);

  const convWithDoctor = doctorId
    ? displayConversations.find((c) => c.doctorId === doctorId)
    : null;

  const handlePickDoctor = async () => {
    if (convWithDoctor) {
      setSelectedConversationId(convWithDoctor.id);
      await loadMessages(String(convWithDoctor.id));
      if (socket && user?.id)
        joinConversationRoom(socket, convWithDoctor.id, user.id);
    } else {
      // bắt đầu mới → mở khung chat rỗng
      setSelectedConversationId(null);
      setMessages([]);
    }
  };

  // hiển thị khung chat nếu đã có convId hoặc đang mở theo doctorId
  const hasOpenChat =
    selectedConversationId !== null || (!!doctorId && !!dataDoctor);

  return (
    <div className="min-h-screen bg-gray-50 max-w7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Tin nhắn</h1>
        <p className="text-gray-600">Trao đổi với bác sĩ và nhận tư vấn y tế</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg h-[600px] md:h-[700px] flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
            hasOpenChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                Tin nhắn
              </h1>
            </div>
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

          <div className="flex-1 overflow-y-auto">
            {/* Card bác sĩ khi vào theo doctorId */}
            {doctorId && dataDoctor && !convWithDoctor && (
              <div
                onClick={handlePickDoctor}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 `}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={dataDoctor.avatarUrl || undefined}
                        style={{
                          backgroundImage: !dataDoctor.avatarUrl
                            ? "linear-gradient(135deg, #1890ff, #096dd9)"
                            : undefined,
                          color: "#fff",
                          fontSize: "35px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "4px solid #ffffff",
                          boxShadow: "0 8px 25px rgba(24, 144, 255, 0.25)",
                        }}
                        className="!w-12 !h-12 !rounded-full !object-cover"
                      >
                        {!dataDoctor.avatarUrl &&
                          dataDoctor.fullName?.charAt(0).toUpperCase()}
                      </Avatar>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {dataDoctor.title} {dataDoctor.fullName}
                      </h3>
                      <span className="text-xs text-gray-500">—</span>
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

            {/* Danh sách hội thoại */}
            {displayConversations.length > 0 ? (
              displayConversations
                // (optional) filter theo ô search
                .filter((c) =>
                  c.doctorInfo.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((conv) => (
                  <div
                    key={conv.id}
                    onClick={async () => {
                      didAutoOpenRef.current = true;
                      setSelectedConversationId(conv.id);
                      await loadMessages(String(conv.id));
                      if (socket && user?.id)
                        joinConversationRoom(socket, conv.id, user.id);
                      // clear unread for this conv
                      if (user?.id) {
                        markMessagesAsReadAPI(conv.id, user.id).finally(() =>
                          setUnreadByConv((prev) => ({ ...prev, [conv.id]: 0 }))
                        );
                      }
                      try {
                        const doctorRes = await getDoctorDetailBookingById(
                          conv.doctorId
                        );
                        if (doctorRes.data) setDataDoctor(doctorRes.data);
                      } catch (e) {
                        console.error("Error loading doctor info:", e);
                      }
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversationId === conv.id
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="flex-shrink-0">
                          <Avatar
                            src={conv.doctorInfo.avatarUrl || undefined}
                            style={{
                              backgroundImage: !conv.doctorInfo.avatarUrl
                                ? "linear-gradient(135deg, #1890ff, #096dd9)"
                                : undefined,
                              color: "#fff",
                              fontSize: "35px",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "4px solid #ffffff",
                              boxShadow: "0 8px 25px rgba(24, 144, 255, 0.25)",
                            }}
                            className="!w-12 !h-12 !rounded-full !object-cover"
                          >
                            {!conv.doctorInfo.avatarUrl &&
                              conv.doctorInfo.fullName?.charAt(0).toUpperCase()}
                          </Avatar>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conv.doctorInfo.fullName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conv.lastMessage?.timestamp ?? "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={`text-sm truncate ${
                              unreadByConv[conv.id]
                                ? "font-semibold text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {conv.lastMessage?.content ??
                              "Bắt đầu cuộc trò chuyện"}
                          </p>
                          {unreadByConv[conv.id] ? (
                            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                              {unreadByConv[conv.id]}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
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
            !hasOpenChat ? "hidden md:flex" : "flex"
          }`}
        >
          {hasOpenChat ? (
            <>
              {/* Header chat */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                      <div className="flex-shrink-0">
                        <Avatar
                          src={dataDoctor?.avatarUrl || undefined}
                          style={{
                            backgroundImage: !dataDoctor?.avatarUrl
                              ? "linear-gradient(135deg, #1890ff, #096dd9)"
                              : undefined,
                            color: "#fff",
                            fontSize: "35px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "4px solid #ffffff",
                            boxShadow: "0 8px 25px rgba(24, 144, 255, 0.25)",
                          }}
                          className="!w-12 !h-12 !rounded-full !object-cover"
                        >
                          {!dataDoctor?.avatarUrl &&
                            dataDoctor?.fullName?.charAt(0).toUpperCase()}
                        </Avatar>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>

                    <div>
                      <h2 className="font-medium text-gray-900">
                        {dataDoctor?.title} {dataDoctor?.fullName}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">Đang hoạt động</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-blue-600">
                          {dataDoctor?.specialty?.specialtyName}
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

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
              >
                {/* Tin nhắn chào mừng */}
                <div className="flex justify-center">
                  <div className="bg-blue-100 px-4 py-2 rounded-lg text-center max-w-md">
                    <p className="text-sm text-blue-800">
                      Bạn đã bắt đầu cuộc trò chuyện với {dataDoctor?.title}{" "}
                      {dataDoctor?.fullName}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Hãy mô tả triệu chứng hoặc đặt câu hỏi để được tư vấn
                    </p>
                  </div>
                </div>

                {/* Real-time messages */}
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

              {/* Input */}
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
