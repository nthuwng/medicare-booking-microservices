import type { IDoctorProfileResponseMessage, IPatientProfile } from "./user";

export interface IConversation {
  id: number;
  doctorId: string;
  patientId: string;
  doctorInfo: IDoctorProfileResponseMessage;
  patientInfo: IPatientProfile;
  supportId: string | null;
  lastMessage: ILastMessage;
  lastMessageAt: string;
  createdAt: string;
  type: string;
}

export interface ILastMessage {
  id: number;
  content: string;
  senderId: string;
  senderType: string;
  messageType: string;
  createdAt: string;
  timestamp: string;
}
// Interface để hiển thị trong conversation list
export interface IConversationDisplay {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageType: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  type: string;
  doctorId: string;
  patientId?: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  messageType: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IConversationResponse {
  user: IPatientProfile;
  conversations: IConversation[];
  total: number;
}

export interface IConversationResponseDoctor {
  doctor: IDoctorProfileResponseMessage;
  conversations: IConversation[];
}
