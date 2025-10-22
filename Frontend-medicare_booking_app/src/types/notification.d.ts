export interface INotificationDataAdmin {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: {
    data: {
      doctorId: string;
      phone: string;
      doctorName: string;
      doctorUserId: string;
      avatar_url: string;
      approvalStatus: string;
      registrationTime: string;
      email: string;
    };
    type: string;
    title: string;
    userId: string;
    message: string;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
