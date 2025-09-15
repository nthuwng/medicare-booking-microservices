import { ConversationType, MessageType, SenderType } from "@prisma/client";
import { prisma } from "src/config/client";

const createConversationService = async (
  patientId: string,
  doctorId: string
) => {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      patientId,
      doctorId,
    },
  });
  if (existingConversation) {
    console.log("Conversation đã tồn tại");
    return existingConversation;
  }

  const conversation = await prisma.conversation.create({
    data: {
      patientId,
      doctorId,
      type: ConversationType.DOCTOR_PATIENT,
    },
  });

  return conversation;
};

const createMessageService = async (
  conversationId: number,
  senderId: string,
  senderType: SenderType,
  content: string,
  messageType: MessageType
) => {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      senderType,
      content,
      messageType,
    },
  });
  return message;
};

export { createConversationService, createMessageService };
