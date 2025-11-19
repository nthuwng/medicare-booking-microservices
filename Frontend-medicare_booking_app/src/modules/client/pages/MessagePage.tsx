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
  Loader2,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import type { IDoctorProfile } from "@/types";
import type { IConversation, ILastMessage } from "@/types/message";
import { useCurrentApp } from "@/components/contexts/app.context";
import { FaImages } from "react-icons/fa";
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
  uploadFileAPIClient,
} from "../services/client.api";
import { App, Avatar, Button, Image, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

type NavState = { doctorId?: string };

const MessagePage = () => {
  const { notification } = App.useApp();
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
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null
  );

  const clearPendingImage = () => {
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }
    setPendingImageFile(null);
    setPendingImagePreview(null);
  };

  const { user, theme } = useCurrentApp();
  const isDark = theme === "dark";

  const [socket, setSocket] = useState<Socket | null>(null);
  const [patientIdState, setPatientIdState] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [unreadByConv, setUnreadByConv] = useState<Record<number, number>>({});
  const didAutoOpenRef = useRef(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const currentConvIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
        messageType: msg.messageType,
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
              messageType: msg.messageType,
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

  const handleSendImage = async (file: File) => {
    if (!socket || !user?.id) return;

    // Tạo URL preview local để show ngay
    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;

    // Message tạm để hiển thị "Đang gửi ảnh..."
    const tempMsg = {
      id: tempId,
      content: previewUrl,
      messageType: "IMAGE",
      timestamp: "",
      isOwn: true,
      conversationId: selectedConversationId,
      senderId: user.id,
      isLoading: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      // 1) Upload ảnh
      const res = await uploadFileAPIClient(file);
      const backendRes = res.data; // IBackendRes<{ url, public_id }>

      if (!backendRes?.url) {
        notification.error({
          message: "Lỗi tải ảnh",
          description: res?.message || "Không lấy được URL ảnh từ máy chủ",
        });
        // Xoá message tạm
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }

      const imageUrl = backendRes?.url;

      const base = {
        senderId: user.id,
        senderType: "PATIENT" as const,
        content: imageUrl,
        messageType: "IMAGE" as const,
      };

      let ack;
      if (selectedConversationId) {
        ack = await sendMessage(socket, {
          ...base,
          conversationId: selectedConversationId,
        });
      } else {
        if (!patientIdState || !doctorId) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }
        ack = await sendMessage(socket, {
          ...base,
          patientId: patientIdState,
          doctorId,
        });
      }

      if (!ack?.ok) {
        console.error("Send image failed:", ack?.error);
        notification.error({
          message: "Gửi ảnh thất bại",
          description: "Vui lòng thử lại",
        });
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }

      // ✅ Thành công:
      // Xoá message tạm, để message "thật" do socket onMessageNew tự thêm vào
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      // Nếu vừa tạo mới conversation
      if (!selectedConversationId && ack.conversationId) {
        setSelectedConversationId(ack.conversationId);
        if (socket && user?.id)
          joinConversationRoom(socket, ack.conversationId, user.id);
        await loadMessages(String(ack.conversationId));
      }

      setTimeout(scrollToBottom, 50);
    } catch (e) {
      console.error("Upload/send image error:", e);
      notification.error({
        message: "Lỗi tải ảnh",
        description: "Có lỗi xảy ra khi tải ảnh lên, vui lòng thử lại.",
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      // Giải phóng URL local
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // clear preview cũ nếu có
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
    }

    setPendingImageFile(file);
    const url = URL.createObjectURL(file);
    setPendingImagePreview(url);

    // reset value để lần sau chọn cùng file vẫn trigger
    e.target.value = "";
  };

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
    if (!socket || !user?.id) return;

    const text = messageInput.trim();
    const hasText = text.length > 0;
    const hasImage = !!pendingImageFile;

    if (!hasText && !hasImage) return;

    let convId = selectedConversationId;

    const baseSender = {
      senderId: user.id,
      senderType: "PATIENT" as const,
    };

    // ===== 1. Nếu có ảnh: upload + gửi ảnh =====
    if (hasImage && pendingImageFile) {
      const file = pendingImageFile;

      // message tạm để show "đang gửi ảnh..."
      const localUrl = pendingImagePreview || URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          content: localUrl,
          messageType: "IMAGE",
          timestamp: "",
          isOwn: true,
          conversationId: convId,
          senderId: user.id,
          isLoading: true,
        },
      ]);
      setTimeout(scrollToBottom, 50);

      try {
        const res = await uploadFileAPIClient(file);
        const backendRes = res.data;

        if (!backendRes?.url) {
          notification.error({
            message: "Lỗi tải ảnh",
            description: res?.message || "Không lấy được URL ảnh từ máy chủ",
          });
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        const imageUrl = backendRes.url;
        let ack;

        if (convId) {
          ack = await sendMessage(socket, {
            ...baseSender,
            content: imageUrl,
            messageType: "IMAGE" as const,
            conversationId: convId,
          });
        } else {
          if (!patientIdState || !doctorId) return;
          ack = await sendMessage(socket, {
            ...baseSender,
            content: imageUrl,
            messageType: "IMAGE" as const,
            patientId: patientIdState,
            doctorId,
          });
        }

        if (!ack?.ok) {
          notification.error({
            message: "Gửi ảnh thất bại",
            description: "Vui lòng thử lại",
          });
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        // socket sẽ đẩy message "thật", xoá temp
        setMessages((prev) => prev.filter((m) => m.id !== tempId));

        // nếu đây là message đầu tiên → tạo conversation
        if (!convId && ack.conversationId) {
          convId = ack.conversationId;
          setSelectedConversationId(ack.conversationId);
          if (socket && user?.id) {
            joinConversationRoom(socket, ack.conversationId, user.id);
          }
        }
      } catch (err) {
        console.error("Upload/send image error:", err);
        notification.error({
          message: "Lỗi tải ảnh",
          description: "Có lỗi xảy ra khi tải ảnh lên, vui lòng thử lại.",
        });
      } finally {
        clearPendingImage();
      }
    }

    // ===== 2. Nếu có text: gửi text =====
    if (hasText) {
      const baseText = {
        ...baseSender,
        content: text,
        messageType: "TEXT" as const,
      };

      let ackText;

      if (convId) {
        ackText = await sendMessage(socket, {
          ...baseText,
          conversationId: convId,
        });
      } else {
        if (!patientIdState || !doctorId) return;
        ackText = await sendMessage(socket, {
          ...baseText,
          patientId: patientIdState,
          doctorId,
        });
      }

      if (!convId && ackText?.conversationId) {
        convId = ackText.conversationId;
        setSelectedConversationId(convId);
        if (socket && user?.id) {
          joinConversationRoom(socket, convId, user.id);
        }
      }
    }

    setMessageInput("");
    setTimeout(scrollToBottom, 50);
  };

  // nếu dùng TypeScript, thêm: import type React from "react"; ở đầu file
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault(); // chặn dán text base64

          if (pendingImagePreview) {
            URL.revokeObjectURL(pendingImagePreview);
          }

          setPendingImageFile(file);
          const url = URL.createObjectURL(file);
          setPendingImagePreview(url);
        }
        break;
      }
    }
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

          <div className="flex-1 overflow-y-auto overscroll-contain">
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
                          <div
                            className={cls(
                              "text-sm truncate flex items-center gap-2",
                              unreadByConv[conv.id]
                                ? isDark
                                  ? "font-semibold text-gray-100"
                                  : "font-semibold text-gray-900"
                                : textMuted
                            )}
                          >
                            {conv.lastMessage &&
                            conv.lastMessage.messageType === "IMAGE" &&
                            conv.lastMessage.content ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
                                <FaImages className="w-3 h-3" />
                                <span>Hình ảnh</span>
                              </span>
                            ) : conv.lastMessage ? (
                              <span>{conv.lastMessage.content}</span>
                            ) : (
                              <span>Bắt đầu cuộc trò chuyện</span>
                            )}
                          </div>
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
                  "flex-1 overflow-y-auto overscroll-contain p-4 space-y-2",
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
                        "max-w-xs lg:max-w-md px-3 py-2 rounded-lg relative",
                        message.isOwn ? "bg-blue-500 text-white" : bubbleOther
                      )}
                    >
                      {message.messageType === "IMAGE" ? (
                        <>
                          <div className="relative">
                            <img
                              src={message.content}
                              alt="Ảnh tin nhắn"
                              onClick={() =>
                                !message.isLoading &&
                                setPreviewImage(message.content)
                              }
                              className={cls(
                                "max-w-[220px] max-h-[220px] rounded-md object-cover cursor-zoom-in",
                                message.isLoading ? "opacity-60" : ""
                              )}
                            />
                            {message.isLoading && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex items-center gap-1 bg-black/50 text-white text-[11px] px-2 py-1 rounded-full">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Đang gửi ảnh...</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <p
                            className={cls(
                              "text-[11px] mt-1 text-right",
                              message.isOwn ? "text-blue-100" : textMuted2
                            )}
                          >
                            {message.isLoading
                              ? "Đang gửi..."
                              : message.timestamp}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <p
                            className={cls(
                              "text-xs mt-1 text-right",
                              message.isOwn ? "text-blue-100" : textMuted2
                            )}
                          >
                            {message.timestamp}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className={cls("p-4 border-t", borderSoft, panel)}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectImage}
                />
                {pendingImagePreview && (
                  <div className="mb-3">
                    <div
                      className={cls(
                        "relative inline-block rounded-2xl overflow-hidden shadow-md",
                        isDark
                          ? "border border-slate-600/70 bg-[#050816]"
                          : "border border-slate-200 bg-white"
                      )}
                    >
                      {/* Ảnh preview */}
                      <Image
                        src={pendingImagePreview}
                        alt="Ảnh xem trước"
                        className="!w-[110px] !h-[110px] !object-cover"
                        preview={{
                          mask: (
                            <div className="text-xs font-medium text-white">
                              Xem trước
                            </div>
                          ),
                        }}
                      />

                      {/* Nút xoá nhỏ gọn trong góc */}
                      <button
                        type="button"
                        onClick={clearPendingImage}
                        className={cls(
                          "absolute top-1.5 right-1.5 flex items-center justify-center",
                          "w-6 h-6 rounded-full border shadow-sm transition cursor-pointer",
                          isDark
                            ? "bg-black/55 border-white/40 hover:bg-black/80"
                            : "bg-red-500/90 border-white/70 hover:bg-red-500"
                        )}
                      >
                        <CloseOutlined
                          style={{
                            fontSize: 10,
                            color: "#fff",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
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
                      onPaste={handlePaste}
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
          <Modal
            open={!!previewImage}
            footer={null}
            onCancel={() => setPreviewImage(null)}
            centered
            width="auto"
            style={{ maxWidth: "90vw" }}
            bodyStyle={{
              padding: 0,
              background: "transparent",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {previewImage && (
              <img
                src={previewImage}
                alt="Xem ảnh"
                style={{
                  maxHeight: "80vh",
                  maxWidth: "100%",
                  borderRadius: 8,
                  display: "block",
                }}
              />
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
