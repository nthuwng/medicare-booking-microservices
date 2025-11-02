import { useEffect, useRef, useState, useMemo } from "react";
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
import { useLocation } from "react-router-dom";
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
  getUnreadCountMessageAPI,
  markMessagesAsReadAPI,
} from "../services/client.api";
import { Avatar } from "antd";

type NavState = { doctorId?: string };

const MessagePage = () => {
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

  const { user, theme } = useCurrentApp();
  const isDark = theme === "dark";

  const [socket, setSocket] = useState<Socket | null>(null);
  const [patientIdState, setPatientIdState] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [unreadByConv, setUnreadByConv] = useState<Record<number, number>>({});
  const didAutoOpenRef = useRef(false);
  const currentConvIdRef = useRef<number | null>(null);
  useEffect(() => {
    currentConvIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // --------- helpers cho className theo theme ----------
  // --------- helpers cho className theo theme ----------
  const cls = (...x: string[]) => x.filter(Boolean).join(" ");

  // Khung/panel chính
  const panel = isDark
    ? "bg-[#0f1b2d] border-[#1f2a3a] text-gray-100"
    : "bg-white/90 backdrop-blur border-slate-200 text-slate-900 shadow-sm";

  // Header/ô nền nhẹ
  const panelSoft = isDark ? "bg-[#0c1626]" : "bg-slate-50";

  // Viền dịu
  const borderSoft = isDark ? "border-[#1f2a3a]" : "border-slate-200";

  // Text muted
  const textMuted = isDark ? "text-gray-300" : "text-slate-600";
  const textMuted2 = isDark ? "text-gray-400" : "text-slate-500";

  // Nền trang
  const bgPage = isDark ? "bg-[#111A2B]" : "bg-white";

  // Input
  const inputBase =
    "w-full rounded-lg outline-none transition border px-4 py-2";
  const inputTone = isDark
    ? "bg-[#0f1b2d] border-[#223047] placeholder-gray-400 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    : "bg-white border-slate-300 placeholder-slate-400 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  // Bubble của đối phương
  const bubbleOther = isDark
    ? "bg-[#0f1b2d] text-gray-100 border border-[#223047]"
    : "bg-slate-100 text-slate-900 border border-slate-200";

  // --------------- APIs / socket -----------------
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
    const c = messagesContainerRef.current;
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
  };
  const isNearBottom = () => {
    const c = messagesContainerRef.current;
    if (!c) return true;
    return c.scrollTop + c.clientHeight >= c.scrollHeight - 100;
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

  useEffect(() => {
    if (!socket || !user?.id) return;
    joinUserRoom(socket, user.id);
  }, [socket, user?.id]);

  useEffect(() => {
    if (!socket || !selectedConversationId) return;
    joinConversationRoom(socket, Number(selectedConversationId), user?.id);
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

  // auto open conv by doctorId
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (!doctorId || displayConversations.length === 0) return;
    const found = displayConversations.find((c) => c.doctorId === doctorId);
    if (!found) return;

    didAutoOpenRef.current = true;
    setSelectedConversationId(found.id);
    loadMessages(String(found.id));
    if (socket && user?.id) joinConversationRoom(socket, found.id, user.id);
    getDoctorDetailBookingById(found.doctorId)
      .then((res) => res?.data && setDataDoctor(res.data as any))
      .catch(() => {});
  }, [doctorId, displayConversations]);

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
        if (user?.id)
          markMessagesAsReadAPI(Number(msg.conversationId), user.id);
      } else {
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
          fetchAllConversationsPatient();
          return prev;
        }
      });

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

    if (!ack?.ok) return;

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
      setSelectedConversationId(null);
      setMessages([]);
    }
  };

  const hasOpenChat =
    selectedConversationId !== null || (!!doctorId && !!dataDoctor);

  return (
    <div className={cls("min-h-screen max-w7xl mx-auto", bgPage)}>
      {/* Header */}
      <div className="mb-4">
        <h1
          className={cls(
            "text-2xl font-bold",
            isDark ? "text-gray-100" : "text-gray-800"
          )}
        >
          Tin nhắn
        </h1>
        <p className={cls(textMuted)}>
          Trao đổi với bác sĩ và nhận tư vấn y tế
        </p>
      </div>

      <div
        className={cls(
          "rounded-lg h-[600px] md:h-[700px] flex overflow-hidden border",
          panel
        )}
      >
        {/* Sidebar */}
        <div
          className={cls(
            "w-full md:w-1/3 flex flex-col",
            borderSoft,
            "border-r",
            hasOpenChat ? "hidden md:flex" : "flex"
          )}
        >
          <div className={cls("p-4 border-b", borderSoft, panelSoft)}>
            <div className="flex items-center justify-between mb-4">
              <h1
                className={cls(
                  "text-xl font-bold flex items-center",
                  isDark ? "text-gray-100" : "text-gray-800"
                )}
              >
                <MessageCircle
                  className={cls(
                    "w-6 h-6 mr-2",
                    isDark ? "text-blue-400" : "text-blue-600"
                  )}
                />
                Tin nhắn
              </h1>
            </div>
            <div className="relative">
              <Search
                className={cls(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                  textMuted2
                )}
              />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cls(inputBase, inputTone, "pl-10")}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Card bác sĩ khi vào theo doctorId */}
            {doctorId && dataDoctor && !convWithDoctor && (
              <div
                onClick={handlePickDoctor}
                className={cls(
                  "p-4 cursor-pointer transition-colors border-b",
                  borderSoft,
                  isDark ? "hover:bg-[#0f1b2d]" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar
                      src={dataDoctor.avatarUrl || undefined}
                      style={{
                        backgroundImage: !dataDoctor.avatarUrl
                          ? "linear-gradient(135deg, #1890ff, #096dd9)"
                          : undefined,
                        color: "#fff",
                        fontSize: "35px",
                        fontWeight: 600,
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
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={cls(
                          "font-medium truncate",
                          isDark ? "text-gray-100" : "text-gray-900"
                        )}
                      >
                        {dataDoctor.title} {dataDoctor.fullName}
                      </h3>
                      <span className={cls("text-xs", textMuted2)}>—</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className={cls("text-sm truncate", textMuted)}>
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
                      } catch {}
                    }}
                    className={cls(
                      "p-4 transition-colors border-b",
                      borderSoft,
                      selectedConversationId === conv.id
                        ? isDark
                          ? "bg-[#0c1626] border-r-4 border-blue-500"
                          : "bg-blue-50 border-r-4 border-blue-500"
                        : isDark
                        ? "hover:bg-[#0f1b2d]"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar
                        src={conv.doctorInfo.avatarUrl || undefined}
                        style={{
                          backgroundImage: !conv.doctorInfo.avatarUrl
                            ? "linear-gradient(135deg, #1890ff, #096dd9)"
                            : undefined,
                          color: "#fff",
                          fontSize: "35px",
                          fontWeight: 600,
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

                      <div className="flex-1 min-w-0 ml-3">
                        <div className="flex items-center justify-between">
                          <h3
                            className={cls(
                              "font-medium truncate",
                              isDark ? "text-gray-100" : "text-gray-900"
                            )}
                          >
                            {conv.doctorInfo.fullName}
                          </h3>
                          <span className={cls("text-xs", textMuted2)}>
                            {conv.lastMessage?.timestamp ?? "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={cls(
                              "text-sm truncate",
                              unreadByConv[conv.id]
                                ? isDark
                                  ? "font-semibold text-gray-100"
                                  : "font-semibold text-gray-900"
                                : textMuted
                            )}
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
              <div className={cls("p-4 text-center", textMuted)}>
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
          className={cls(
            "flex-1 flex flex-col",
            !hasOpenChat ? "hidden md:flex" : "flex"
          )}
        >
          {hasOpenChat ? (
            <>
              {/* Header chat */}
              <div
                className={cls(
                  "p-4 border-b flex items-center justify-between",
                  borderSoft,
                  panel
                )}
              >
                <div className="flex items-center space-x-3">
                  <button
                    className={cls(
                      "md:hidden p-2 rounded-lg",
                      isDark ? "hover:bg-[#0c1626]" : "hover:bg-gray-100"
                    )}
                  >
                    <ArrowLeft className={cls("w-5 h-5", textMuted)} />
                  </button>

                  <div className="relative">
                    <Avatar
                      src={dataDoctor?.avatarUrl || undefined}
                      style={{
                        backgroundImage: !dataDoctor?.avatarUrl
                          ? "linear-gradient(135deg, #1890ff, #096dd9)"
                          : undefined,
                        color: "#fff",
                        fontSize: "35px",
                        fontWeight: 600,
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
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div>
                    <h2
                      className={cls(
                        "font-medium",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}
                    >
                      {dataDoctor?.title} {dataDoctor?.fullName}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className={cls("text-sm", textMuted2)}>
                        Đang hoạt động
                      </p>
                      <span className={cls(textMuted2)}>•</span>
                      <p className="text-sm text-blue-500">
                        {dataDoctor?.specialty?.specialtyName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className={cls(
                      "p-2 rounded-lg transition-colors",
                      isDark ? "hover:bg-[#0c1626]" : "hover:bg-gray-100"
                    )}
                  >
                    <Phone className={cls("w-5 h-5", textMuted)} />
                  </button>
                  <button
                    className={cls(
                      "p-2 rounded-lg transition-colors",
                      isDark ? "hover:bg-[#0c1626]" : "hover:bg-gray-100"
                    )}
                  >
                    <Video className={cls("w-5 h-5", textMuted)} />
                  </button>
                  <button
                    className={cls(
                      "p-2 rounded-lg transition-colors",
                      isDark ? "hover:bg-[#0c1626]" : "hover:bg-gray-100"
                    )}
                  >
                    <MoreVertical className={cls("w-5 h-5", textMuted)} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className={cls(
                  "flex-1 overflow-y-auto p-4 space-y-2",
                  isDark ? "bg-[#0b1220]" : "bg-gray-50"
                )}
              >
                {/* Welcome bubble */}
                <div className="flex justify-center">
                  <div
                    className={cls(
                      "px-4 py-2 rounded-lg text-center max-w-md",
                      isDark
                        ? "bg-[#0c1626] text-blue-300"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    <p className="text-sm">
                      Bạn đã bắt đầu cuộc trò chuyện với {dataDoctor?.title}{" "}
                      {dataDoctor?.fullName}
                    </p>
                    <p
                      className={cls(
                        "text-xs mt-1",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )}
                    >
                      Hãy mô tả triệu chứng hoặc đặt câu hỏi để được tư vấn
                    </p>
                  </div>
                </div>

                {/* Real-time messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cls(
                      "flex",
                      message.isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cls(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        message.isOwn ? "bg-blue-500 text-white" : bubbleOther
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cls(
                          "text-xs mt-1",
                          message.isOwn ? "text-blue-100" : textMuted2
                        )}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className={cls("p-4 border-t", borderSoft, panel)}>
                <div className="flex items-center space-x-2">
                  <button
                    className={cls(
                      "p-2 rounded-lg transition-colors",
                      isDark ? "hover:bg-[#0c1626]" : "hover:bg-gray-100"
                    )}
                  >
                    <Paperclip className={cls("w-5 h-5", textMuted)} />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Nhập tin nhắn..."
                      className={cls(inputBase, inputTone)}
                    />
                  </div>

                  <button
                    className={cls(
                      "p-2 rounded-lg transition-colors",
                      isDark ? "hover:bg-[#0c1626]" : "hover:bg-gray-100"
                    )}
                  >
                    <Smile className={cls("w-5 h-5", textMuted)} />
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
              <p className={cls(textMuted)}>Chọn cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
