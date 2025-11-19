import { prisma } from "src/config/client";
import {
  getDoctorByIdViaRabbitMQ,
  getDoctorIdByUserIdViaRabbitMQ,
  getPatientByIdViaRabbitMQ,
  getPatientIdByUserIdViaRabbitMQ,
} from "src/queue/publishers/message.publisher";
import { MessageType, SenderType } from "@prisma/client";

const getMessagesByConversationIdService = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: parseInt(conversationId) },
    orderBy: { createdAt: "asc" },
  });
  return messages;
};

const getAllConversationsByPatientService = async (patientId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      patientId,
      // Chỉ lấy conversations có ít nhất 1 tin nhắn
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Lấy tin nhắn cuối cùng
      },
    },
    orderBy: { lastMessageAt: "desc" }, // Conversation mới nhất lên đầu
  });
  return conversations;
};

const getAllConversationsByDoctorService = async (doctorId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      doctorId,
      // Chỉ lấy conversations có ít nhất 1 tin nhắn
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Lấy tin nhắn cuối cùng
      },
    },
    orderBy: { lastMessageAt: "desc" }, // Conversation mới nhất lên đầu
  });
  return conversations;
};

const getConversationsByRoleService = async (
  role: "DOCTOR" | "PATIENT",
  userId: string
) => {
  let conversations;
  let userInfo;

  if (role === "PATIENT") {
    conversations = await prisma.conversation.findMany({
      where: { patientId: userId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    });
    userInfo = await getPatientByIdViaRabbitMQ(userId);
  } else {
    conversations = await prisma.conversation.findMany({
      where: { doctorId: userId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    });
    userInfo = await getDoctorByIdViaRabbitMQ(userId);
  }

  if (!userInfo) throw new Error(`${role} not found`);

  const formattedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const [doctorInfo, patientInfo] = await Promise.all([
        getDoctorByIdViaRabbitMQ(conv.doctorId!),
        getPatientByIdViaRabbitMQ(conv.patientId!),
      ]);

      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        doctorId: conv.doctorId,
        patientId: conv.patientId,
        doctorInfo: doctorInfo || null,
        patientInfo: patientInfo || null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderType: lastMessage.senderType,
              messageType: lastMessage.messageType,
              fileUrl: lastMessage.fileUrl,
              fileName: lastMessage.fileName,
              fileSize: lastMessage.fileSize,
              createdAt: lastMessage.createdAt,
              timestamp: new Date(lastMessage.createdAt).toLocaleTimeString(
                "vi-VN",
                {
                  timeZone: "Asia/Ho_Chi_Minh",
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        type: conv.type,
      };
    })
  );

  return {
    user: userInfo,
    conversations: formattedConversations,
    total: formattedConversations.length,
  };
};



const createOrGetConversationService = async (
  doctorId: string,
  patientId: string
) => {
  // Kiểm tra doctor và patient có tồn tại không
  const [doctorInfo, patientInfo] = await Promise.all([
    getDoctorByIdViaRabbitMQ(doctorId),
    getPatientByIdViaRabbitMQ(patientId),
  ]);

  if (!doctorInfo) {
    throw new Error("Doctor not found");
  }

  if (!patientInfo) {
    throw new Error("Patient not found");
  }

  // Tìm conversation đã tồn tại
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      patientId,
      doctorId,
    },
  });

  let conversation;
  if (existingConversation) {
    conversation = existingConversation;
  } else {
    // Tạo conversation mới
    conversation = await prisma.conversation.create({
      data: {
        patientId,
        doctorId,
        type: "DOCTOR_PATIENT",
      },
    });
  }

  return {
    conversation: {
      id: conversation.id,
      patientId: conversation.patientId,
      doctorId: conversation.doctorId,
      type: conversation.type,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
    },
    doctor: doctorInfo,
    patient: patientInfo,
  };
};

const sendMessageService = async (
  conversationId: number,
  senderId: string,
  senderType: SenderType,
  content: string,
  messageType: MessageType,
  fileUrl?: string | null,
  fileName?: string | null,
  fileSize?: number | null
) => {
  // Tạo message và cập nhật lastMessageAt của conversation trong một transaction
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        senderType,
        content,
        messageType,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    senderId: message.senderId,
    senderType: message.senderType,
    messageType: message.messageType,
    fileUrl: message.fileUrl,
    fileName: message.fileName,
    fileSize: message.fileSize,
    createdAt: message.createdAt,
    timestamp: new Date(message.createdAt).toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const markMessagesAsReadService = async (
  conversationId: number,
  currentUserId: string
) => {
  // Lấy thông tin conversation để xác định đối tác
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        where: {
          isRead: false,
          // Chỉ đánh dấu tin nhắn của đối phương (không phải của user hiện tại)
          senderId: { not: currentUserId },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Cập nhật tất cả tin nhắn chưa đọc của đối phương
  const updatedMessages = await prisma.message.updateMany({
    where: {
      conversationId,
      isRead: false,
      senderId: { not: currentUserId },
    },
    data: {
      isRead: true,
    },
  });

  return {
    conversationId,
    updatedCount: updatedMessages.count,
    messages: conversation.messages,
  };
};

const getUnreadCountService = async (userId: string) => {
  const patientId = await getPatientIdByUserIdViaRabbitMQ(userId);

  const doctorId = await getDoctorIdByUserIdViaRabbitMQ(userId);

  // Lấy các conversation id
  const convs = await prisma.conversation.findMany({
    where: {
      OR: [{ patientId: patientId ?? "" }, { doctorId: doctorId ?? "" }],
    },
    select: { id: true },
  });
  if (convs.length === 0) return { total: 0, byConversation: [] };

  const convIds = convs.map((c) => c.id);

  // Đếm chưa đọc theo room, chỉ tính tin của đối phương
  const grouped = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: convIds },
      isRead: false,
      senderId: { not: userId }, // <-- userId
    },
    _count: { _all: true },
  });

  const byConversation = grouped.map((g) => ({
    conversationId: g.conversationId,
    count: g._count._all,
  }));
  const total = byConversation.reduce((s, it) => s + it.count, 0);

  return { total, byConversation };
};
export {
  getMessagesByConversationIdService,
  getAllConversationsByPatientService,
  getAllConversationsByDoctorService,
  getConversationsByRoleService,
  createOrGetConversationService,
  sendMessageService,
  markMessagesAsReadService,
  getUnreadCountService,
};
