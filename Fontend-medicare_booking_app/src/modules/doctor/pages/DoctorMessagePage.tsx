// src/pages/DoctorMessagePage.tsx
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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
import {
  getUnreadCountMessageAPI,
  markMessagesAsReadAPI,
} from "../services/doctor.api";
import { useCurrentApp } from "@/components/contexts/app.context";
import { useParams, useNavigate } from "react-router-dom";
import type { IDoctorProfile, IPatientProfile } from "@/types";
import type {
  IConversation,
  IConversationDisplay,
  ILastMessage,
} from "@/types/message";

import {
  connectMessageSocket,
  joinConversationRoom,
  joinUserRoom,
  onConversationUpdated,
  offConversationUpdated,
  onMessageNew,
  offMessageNew,
  sendMessage,
} from "@/sockets/message.socket";
import type { Socket } from "socket.io-client";

// Helper: format giờ VN (nếu backend chưa gắn sẵn timestamp chuỗi)
const fmtTimeVN = (d: Date | string) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(typeof d === "string" ? new Date(d) : d);

const DoctorMessagePage = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentApp();

  // ====== UI + Data State ======
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataDoctor, setDataDoctor] = useState<IDoctorProfile | null>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] =
    useState<IPatientProfile | null>(null);
  const [dataPatientFromParam, setDataPatientFromParam] =
    useState<IPatientProfile | null>(null);

  const [displayConversations, setDisplayConversations] = useState<
    IConversationDisplay[]
  >([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadByConv, setUnreadByConv] = useState<Record<number, number>>({});

  // ====== Socket ======
  const [socket, setSocket] = useState<Socket | null>(null);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<number | null>(null);
  useEffect(() => {
    currentConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);
  const patientCacheRef = useRef<Map<string, IPatientProfile>>(new Map());

  // ====== Scroll helpers ======
  const scrollToBottom = () => {
    const c = messagesContainerRef.current;
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
  };
  const isNearBottom = () => {
    const c = messagesContainerRef.current;
    if (!c) return true;
    const threshold = 100;
    return c.scrollTop + c.clientHeight >= c.scrollHeight - threshold;
  };
  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [messages]);

  // ====== Fetch Doctor profile & Conversations ======
  const fetchConversationsForDoctor = useCallback(
    async (doctorId: string) => {
      try {
        setLoading(true);
        const res = await getAllConversationsDoctorAPI(doctorId);
        const list: IConversation[] = res?.data?.conversations ?? [];

        // Lấy thông tin bệnh nhân song song
        const items = await Promise.all(
          list.map(async (c) => {
            const p = await getPatientProfile(c.patientId);
            const last = c.lastMessage;

            const display: IConversationDisplay & { lastMessageAt?: string } = {
              id: c.id,
              name: p?.full_name || "Bệnh nhân",
              avatar: p?.avatar_url || "",
              lastMessage:
                last?.senderId === user?.id
                  ? `Bạn: ${last?.content ?? ""}`
                  : last?.content ?? "",
              timestamp:
                last?.timestamp ??
                (last?.createdAt ? fmtTimeVN(last.createdAt) : "—"),
              isOnline: true,
              unreadCount: 0,
              type: "patient",
              doctorId: c.doctorId,
              patientId: c.patientId,
              // ⬇️ LƯU THỜI GIAN THÔ để sort
              lastMessageAt: c.lastMessageAt || last?.createdAt || c.createdAt,
            };
            return display;
          })
        );

        items.sort(
          (a, b) =>
            new Date(b.lastMessageAt as string).getTime() -
            new Date(a.lastMessageAt as string).getTime()
        );

        setDisplayConversations(items);
      } catch (e) {
        console.error("❌ load conversations error:", e);
        setDisplayConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const fetchDoctorProfile = useCallback(
    async (uid: string) => {
      const res = await getDoctorProfileByUserId(uid);
      const doc = res.data as IDoctorProfile;
      setDataDoctor(doc ?? null);
      if (doc?.id) {
        await fetchConversationsForDoctor(doc.id);
        // load unread counts for this doctor
        try {
          const unread = await getUnreadCountMessageAPI(uid);
          const map: Record<number, number> = {};
          (unread.data?.byConversation || []).forEach((it: any) => {
            map[it.conversationId] = it.count;
          });
          setUnreadByConv(map);
        } catch {}
      }
      return doc;
    },
    [fetchConversationsForDoctor]
  );

  // ====== Load messages of a conversation ======
  const loadMessages = useCallback(
    async (conversationId: number) => {
      const res = await getMessagesByConversationIdAPI(String(conversationId));
      const rows = res?.data ?? [];
      const formatted = rows.map((m: any) => ({
        id: m.id,
        content: m.content,
        timestamp: m.timestamp ?? fmtTimeVN(m.createdAt),
        isOwn: m.senderId === user?.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
      }));
      setMessages(formatted);
      setTimeout(scrollToBottom, 100);
    },
    [user?.id]
  );

  // ====== First load: socket + doctor profile + param patient ======
  useEffect(() => {
    if (!user?.id) return;
    // socket
    const s = connectMessageSocket();
    setSocket(s);

    // join user room (để nhận conversation:updated realtime)
    joinUserRoom(s, user.id);

    // doctor profile + conversations
    fetchDoctorProfile(user.id);

    // patientId (param) -> preload patient card + giữ chỗ nếu mở từ link
    const preloadPatient = async () => {
      if (!patientId) return;
      const pres = await getPatientDetailBookingById(patientId);
      setDataPatientFromParam(pres.data as IPatientProfile);
      // chưa biết convId với patient này -> khi user click sidebar (hoặc gửi msg đầu tiên) sẽ tạo/join
    };
    preloadPatient();

    return () => {
      setSocket(null);
      s.disconnect();
    };
  }, [user?.id, patientId, fetchDoctorProfile]);

  // ====== Open conversation by clicking a sidebar item ======
  const openConversation = useCallback(
    async (convId: number, patientIdOfConv?: string) => {
      setSelectedConversationId(convId);
      await loadMessages(convId);

      // join conversation room
      if (socket && user?.id) joinConversationRoom(socket, convId, user.id);

      // mark as read
      if (user?.id) {
        markMessagesAsReadAPI(convId, user.id).finally(() =>
          setUnreadByConv((prev) => ({ ...prev, [convId]: 0 }))
        );
      }

      // fetch patient info for header
      if (patientIdOfConv) {
        try {
          const p = await getPatientDetailBookingById(patientIdOfConv);
          setSelectedPatientInfo(p.data as IPatientProfile);
        } catch (e) {
          console.error("load patient header error:", e);
        }
      }
    },
    [socket, user?.id, loadMessages]
  );

  // ====== Auto open conv if coming from /doctor/messages/:patientId and conv existed ======
  useEffect(() => {
    if (!patientId || displayConversations.length === 0) return;
    const conv = displayConversations.find((c) => c.patientId === patientId);
    if (conv) openConversation(conv.id, conv.patientId);
  }, [patientId, displayConversations, openConversation]);

  // ====== Socket listeners: message:new ======
  useEffect(() => {
    if (!socket) return;
    const handleNew = (msg: any) => {
      const isCurrent =
        String(msg.conversationId) === String(currentConversationIdRef.current);
      if (isCurrent) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [
            ...prev,
            {
              id: msg.id,
              content: msg.content,
              timestamp: msg.timestamp ?? fmtTimeVN(msg.createdAt),
              isOwn: msg.senderId === user?.id,
              conversationId: msg.conversationId,
              senderId: msg.senderId,
            },
          ];
        });
        if (user?.id) {
          markMessagesAsReadAPI(Number(msg.conversationId), user.id);
        }
      } else if (msg.senderId !== user?.id) {
        setUnreadByConv((prev) => ({
          ...prev,
          [Number(msg.conversationId)]:
            (prev[Number(msg.conversationId)] || 0) + 1,
        }));
      }
    };
    onMessageNew(socket, handleNew);
    return () => offMessageNew(socket, handleNew);
  }, [socket, user?.id]);

  // ====== Socket listeners: conversation:updated (update preview sidebar) ======
  useEffect(() => {
    if (!socket) return;
    const handleConvUpdated = (payload: {
      conversationId: number;
      doctorId: string;
      patientId: string;
      lastMessage: ILastMessage;
      lastMessageAt: string;
    }) => {
      setDisplayConversations((prev) => {
        const me = user?.id;

        const next = prev
          .map((c) =>
            c.id === payload.conversationId
              ? {
                  ...c,
                  lastMessage:
                    payload.lastMessage?.senderId === me
                      ? `Bạn: ${payload.lastMessage?.content ?? ""}`
                      : payload.lastMessage?.content ?? "",
                  timestamp:
                    payload.lastMessage?.timestamp ??
                    (payload.lastMessage?.createdAt
                      ? fmtTimeVN(payload.lastMessage.createdAt)
                      : c.timestamp),
                  // ⬇️ cập nhật để sort
                  lastMessageAt: payload.lastMessageAt,
                }
              : c
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.lastMessageAt || 0).getTime() -
              new Date(a.lastMessageAt || 0).getTime()
          );

        // nếu chưa có conv này trong list -> refetch
        if (
          !prev.some((c) => c.id === payload.conversationId) &&
          dataDoctor?.id
        ) {
          fetchConversationsForDoctor(dataDoctor.id);
        }

        return next;
      });

      // tăng badge chưa đọc khi không mở phòng chat đó và tin nhắn không phải của mình
      const isFromMe = payload.lastMessage?.senderId === user?.id;
      const isCurrent =
        String(payload.conversationId) ===
        String(currentConversationIdRef.current);
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
  }, [socket, user?.id, dataDoctor?.id, fetchConversationsForDoctor]);

  // ====== Khi click item patient ở trên cùng (mở từ param) ======
  const handlePickPatientFromParam = async () => {
    // Kiểm tra conv có sẵn?
    const conv = displayConversations.find((c) => c.patientId === patientId);
    if (conv) {
      await openConversation(conv.id, conv.patientId);
      return;
    }
    // Chưa có conv → mở khung chat rỗng (sẽ tạo khi gửi tin đầu tiên)
    setSelectedConversationId(null);
    setSelectedPatientInfo(dataPatientFromParam);
    setMessages([]);
  };

  // ====== Send message ======
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !socket || !user?.id || !dataDoctor?.id) return;

    const base = {
      senderId: user.id,
      senderType: "DOCTOR" as const,
      content: messageInput.trim(),
      messageType: "TEXT" as const,
    };

    let ack;
    if (selectedConversationId) {
      // đã có convId
      ack = await sendMessage(socket, {
        ...base,
        conversationId: selectedConversationId,
      });
    } else {
      // chưa có convId: cần patientId (từ param hoặc từ selectedPatientInfo)
      const pid =
        patientId || selectedPatientInfo?.id || dataPatientFromParam?.id;
      if (!pid) return;
      ack = await sendMessage(socket, {
        ...base,
        patientId: pid,
        doctorId: dataDoctor.id,
      });
    }

    if (!ack?.ok) {
      console.error("Send failed:", ack?.error);
      return;
    }

    // Nếu vừa tạo conv mới
    if (!selectedConversationId && ack.conversationId) {
      await openConversation(
        ack.conversationId,
        patientId || selectedPatientInfo?.id || dataPatientFromParam?.id
      );
    }

    setMessageInput("");
    setTimeout(scrollToBottom, 50);
  };

  // ====== Filter list theo search ======
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayConversations;
    return displayConversations.filter((c) =>
      (c.name || "").toLowerCase().includes(q)
    );
  }, [displayConversations, searchQuery]);

  // ở đầu DoctorMessagePage.tsx

  const getPatientProfile = async (pid: string) => {
    if (!pid) return null;
    const cached = patientCacheRef.current.get(pid);
    if (cached) return cached;
    const res = await getPatientDetailBookingById(pid);
    console.log("res", res);
    if (res?.data) {
      patientCacheRef.current.set(pid, res.data);
      return res.data as IPatientProfile;
    }
    return null;
  };

  // ====== Khi click một conversation trong list ======
  const handleClickConversationItem = async (conv: IConversationDisplay) => {
    await openConversation(conv.id, conv.patientId);
    // Lấy tên + avatar bệnh nhân để show header
    try {
      if (conv.patientId) {
        const p = await getPatientDetailBookingById(conv.patientId);
        const pdata = p.data as IPatientProfile;
        setSelectedPatientInfo(pdata);

        // Cập nhật tên hiển thị trong list (để search ngay lần sau)
        setDisplayConversations((prev) =>
          prev.map((x) =>
            x.id === conv.id
              ? { ...x, name: pdata.full_name, avatar: pdata.avatar_url || "" }
              : x
          )
        );
      }
    } catch (e) {
      console.error("load patient for list item error:", e);
    }
  };

  // ====== UI ======
  const hasOpenChat =
    selectedConversationId !== null || !!(patientId && dataPatientFromParam);

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
    <div className="bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg h-[700px] md:h-[800px] flex overflow-hidden">
          {/* Sidebar */}
          <div
            className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
              hasOpenChat ? "hidden md:flex" : "flex"
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Item “patient từ URL” (nếu có) */}
            {patientId && dataPatientFromParam && (
              <div
                onClick={handlePickPatientFromParam}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !selectedConversationId
                    ? "bg-blue-50 border-r-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar
                      size={48}
                      {...(dataPatientFromParam.avatar_url && {
                        src: dataPatientFromParam.avatar_url,
                      })}
                      icon={<FaUser />}
                      style={{ backgroundColor: "#f0f0f0" }}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-500" />
                        {dataPatientFromParam.full_name}
                      </h3>
                      <span className="text-xs text-gray-500">—</span>
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

            {/* Danh sách conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleClickConversationItem(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversationId === conv.id
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar
                          size={48}
                          {...(conv.avatar && { src: conv.avatar })}
                          icon={<FaUser />}
                        />
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-500" />
                            {conv.name || "Bệnh nhân"}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conv.timestamp}
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
                            {conv.lastMessage}
                          </p>
                          {unreadByConv[conv.id] ? (
                            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                              {unreadByConv[conv.id]}
                            </span>
                          ) : null}
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
                ))
              ) : loading ? (
                <div className="p-4 text-center text-gray-500">Đang tải...</div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Chưa có cuộc trò chuyện nào</p>
                  <p className="text-sm mt-1">
                    Bệnh nhân sẽ xuất hiện ở đây khi họ liên hệ tư vấn
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
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
                      <button
                        onClick={() => {
                          setSelectedConversationId(null);
                          setSelectedPatientInfo(null);
                          if (patientId)
                            navigate("/doctor/messages", { replace: true });
                        }}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="relative">
                        <Avatar
                          size={40}
                          {...((selectedPatientInfo || dataPatientFromParam)
                            ?.avatar_url && {
                            src: (selectedPatientInfo || dataPatientFromParam)
                              ?.avatar_url,
                          })}
                          icon={<FaUser />}
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      </div>

                      <div>
                        <h2 className="font-medium text-gray-900">
                          {(selectedPatientInfo || dataPatientFromParam)
                            ?.full_name || "Bệnh nhân"}
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

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
                >
                  {/* Banner */}
                  <div className="flex justify-center">
                    <div className="bg-blue-100 px-4 py-2 rounded-lg text-center max-w-md">
                      <p className="text-sm text-blue-800">
                        Bạn đang tư vấn cho bệnh nhân{" "}
                        {
                          (selectedPatientInfo || dataPatientFromParam)
                            ?.full_name
                        }
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Hãy lắng nghe và đưa ra lời khuyên y khoa phù hợp
                      </p>
                    </div>
                  </div>

                  {/* Real-time */}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          m.isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{m.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            m.isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {m.timestamp}
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
                        onKeyDown={(e) =>
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
