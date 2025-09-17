import { ConversationType, MessageType, SenderType } from "@prisma/client";
import { prisma } from "src/config/client";
import {
  getDoctorUserIdByDoctorIdViaRabbitMQ,
  publishMsgCreatedEvent,
} from "src/queue/publishers/message.publisher";

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
    return existingConversation;
  }

  const doctor = await getDoctorUserIdByDoctorIdViaRabbitMQ(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const doctorUserId = doctor;

  try {
    await publishMsgCreatedEvent(patientId, doctorUserId);
  } catch (publishError) {
    console.error(
      `[Message Service] Failed to publish new message created for ${patientId} and ${doctorUserId}:`,
      publishError
    );
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
  // Tạo message và cập nhật lastMessageAt của conversation
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        senderType,
        content,
        messageType,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
};

export { createConversationService, createMessageService };
