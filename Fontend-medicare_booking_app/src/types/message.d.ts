import type { IPatientProfile } from "./user";

export interface IConversation {
  id: number;
  patientId: string;
  doctorId: string;
  supportId: string | null;
  type: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: IMessage[];
}

// Interface để hiển thị trong conversation list
export interface IConversationDisplay {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  type: string;
  doctorId: string;
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
  patient: IPatientProfile;
  conversations: IConversation[];
}
