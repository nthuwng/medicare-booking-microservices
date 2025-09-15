import { prisma } from "src/config/client";

const getConversationByDoctorIdService = async (doctorId: string) => {
  const conversation = await prisma.conversation.findFirst({
    where: { doctorId },
  });
  return conversation;
};

const getMessagesByConversationIdService = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: parseInt(conversationId) },
  });
  return messages;
};

const getAllConversationsService = async (patientId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: { patientId },
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
  getConversationByDoctorIdService,
  getMessagesByConversationIdService,
  getAllConversationsService,
};
