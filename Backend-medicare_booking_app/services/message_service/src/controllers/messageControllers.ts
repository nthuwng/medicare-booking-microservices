import { Request, Response } from "express";
import {
  getMessagesByConversationIdService,
  getAllConversationsByPatientService,
  getAllConversationsByDoctorService,
} from "src/services/messageServices";
import {
  getDoctorByIdViaRabbitMQ,
  getPatientByIdViaRabbitMQ,
} from "src/queue/publishers/message.publisher";

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

const getAllConversationsPatientAPI = async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const isPatient = await getPatientByIdViaRabbitMQ(patientId);
  if (!isPatient) {
    res.status(404).json({
      success: false,
      message: "Patient not found",
    });
    return;
  }
  const conversations = await getAllConversationsByPatientService(patientId);
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

const getAllConversationsDoctorAPI = async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const isDoctor = await getDoctorByIdViaRabbitMQ(doctorId);
  if (!isDoctor) {
    res.status(404).json({
      success: false,
      message: "Patient not found",
    });
    return;
  }
  const conversations = await getAllConversationsByDoctorService(doctorId);
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
      doctor: isDoctor,
      conversations: conversations,
    },
  });
};

export {
  getMessagesByConversationIdAPI,
  getAllConversationsPatientAPI,
  getAllConversationsDoctorAPI,
};
