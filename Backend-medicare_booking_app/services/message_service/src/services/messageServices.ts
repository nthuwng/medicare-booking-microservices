import { prisma } from "src/config/client";

const getMessagesByConversationIdService = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: parseInt(conversationId) },
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

export {
  getMessagesByConversationIdService,
  getAllConversationsByPatientService,
  getAllConversationsByDoctorService,
};
