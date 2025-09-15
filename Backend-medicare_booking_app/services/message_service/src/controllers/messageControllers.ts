import { Request, Response } from "express";
import {
  getConversationByDoctorIdService,
  getMessagesByConversationIdService,
  getAllConversationsService,
} from "src/services/messageServices";
import { getPatientByIdViaRabbitMQ } from "src/queue/publishers/message.publisher";

const getConversationByDoctorIdAPI = async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const conversation = await getConversationByDoctorIdService(doctorId);
  if (!conversation) {
    res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Conversation fetched successfully",
    data: conversation,
  });
};

const getMessagesByConversationIdAPI = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const messages = await getMessagesByConversationIdService(conversationId);
  if (!messages) {
    res.status(404).json({
      success: false,
      message: "Messages not found",
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: "Messages fetched successfully",
    data: messages,
  });
};

const getAllConversationsAPI = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const isPatient = await getPatientByIdViaRabbitMQ(patientId);
  if (!isPatient) {
    res.status(404).json({
      success: false,
      message: "Patient not found",
    });
    return;
  }
  const conversations = await getAllConversationsService(patientId);
  if (!conversations) {
    res.status(404).json({
      success: false,
      message: "Conversations not found",
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: "Conversations fetched successfully",
    data: {
      patient: isPatient,
      conversations: conversations,
    },
  });
};

export {
  getConversationByDoctorIdAPI,
  getMessagesByConversationIdAPI,
  getAllConversationsAPI,
};
