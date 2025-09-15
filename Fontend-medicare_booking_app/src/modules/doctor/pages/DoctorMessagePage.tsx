import React, { useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Clock,
  User,
  CheckCircle,
  Circle,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  appointmentStatus: "scheduled" | "completed" | "cancelled";
  nextAppointment?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
}

const DoctorMessagePage = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu mẫu cho danh sách bệnh nhân
  const patients: Patient[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      lastMessage: "Cảm ơn bác sĩ đã tư vấn chi tiết.",
      timestamp: "5 phút trước",
      unreadCount: 1,
      isOnline: true,
      appointmentStatus: "scheduled",
      nextAppointment: "Thứ 2, 15/01 - 10:00",
    },
    {
      id: "2",
      name: "Trần Thị B",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      lastMessage: "Thuốc có tác dụng phụ gì không ạ?",
      timestamp: "1 giờ trước",
      unreadCount: 2,
      isOnline: false,
      appointmentStatus: "completed",
      nextAppointment: "Chưa có lịch hẹn",
    },
    {
      id: "3",
      name: "Lê Minh C",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      lastMessage: "Tôi cảm thấy tốt hơn nhiều rồi.",
      timestamp: "2 giờ trước",
      unreadCount: 0,
      isOnline: true,
      appointmentStatus: "scheduled",
      nextAppointment: "Thứ 6, 19/01 - 14:30",
    },
  ];

  // Dữ liệu mẫu cho tin nhắn
  const messages: Message[] = [
    {
      id: "1",
      content: "Chào bác sĩ, em muốn hỏi về kết quả xét nghiệm ạ.",
      timestamp: "10:30",
      isOwn: false,
      type: "text",
      status: "read",
    },
    {
      id: "2",
      content:
        "Chào bạn! Kết quả xét nghiệm của bạn rất tốt. Các chỉ số đều trong mức bình thường.",
      timestamp: "10:32",
      isOwn: true,
      type: "text",
      status: "read",
    },
    {
      id: "3",
      content: "Vậy em có cần uống thuốc gì thêm không ạ?",
      timestamp: "10:35",
      isOwn: false,
      type: "text",
      status: "read",
    },
    {
      id: "4",
      content:
        "Bạn tiếp tục uống thuốc như đơn cũ, nhưng giảm liều xuống còn 1 viên/ngày. Hẹn tái khám sau 2 tuần.",
      timestamp: "10:36",
      isOwn: true,
      type: "text",
      status: "delivered",
    },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatientInfo = patients.find(
    (patient) => patient.id === selectedPatient
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Logic gửi tin nhắn sẽ được thêm vào đây
      setMessageInput("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Circle className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCircle className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCircle className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAppointmentStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Đã đặt lịch";
      case "completed":
        return "Đã khám";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Chưa rõ";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto h-screen">
        <div className="bg-white rounded-lg shadow-lg h-full flex overflow-hidden">
          {/* Sidebar - Danh sách bệnh nhân */}
          <div
            className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
              selectedPatient ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header sidebar */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                  Tin nhắn bệnh nhân
                </h1>
              </div>

              {/* Thanh tìm kiếm */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Danh sách bệnh nhân */}
            <div className="flex-1 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPatient === patient.id
                      ? "bg-blue-50 border-r-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {patient.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate flex items-center">
                          <User className="w-4 h-4 mr-1 text-gray-500" />
                          {patient.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {patient.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {patient.lastMessage}
                        </p>
                        {patient.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {patient.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(
                            patient.appointmentStatus
                          )}`}
                        >
                          {getAppointmentStatusText(patient.appointmentStatus)}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {patient.nextAppointment}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Khu vực chat chính */}
          <div
            className={`flex-1 flex flex-col ${
              !selectedPatient ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedPatient ? (
              <>
                {/* Header chat */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="relative">
                        <img
                          src={selectedPatientInfo?.avatar}
                          alt={selectedPatientInfo?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {selectedPatientInfo?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div>
                        <h2 className="font-medium text-gray-900">
                          {selectedPatientInfo?.name}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            {selectedPatientInfo?.isOnline
                              ? "Đang hoạt động"
                              : "Offline"}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-blue-600">
                            {selectedPatientInfo?.nextAppointment}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Khu vực tin nhắn */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`flex items-center justify-between mt-1 ${
                            message.isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          <p className="text-xs">{message.timestamp}</p>
                          {message.isOwn && (
                            <div className="ml-2">
                              {getStatusIcon(message.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thanh nhập tin nhắn */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Nhập tin nhắn cho bệnh nhân..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>

                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Màn hình chào mừng khi chưa chọn bệnh nhân
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-600 mb-2">
                    Tư vấn và hỗ trợ bệnh nhân
                  </h2>
                  <p className="text-gray-500">
                    Chọn một bệnh nhân để bắt đầu trò chuyện và tư vấn y tế
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessagePage;
