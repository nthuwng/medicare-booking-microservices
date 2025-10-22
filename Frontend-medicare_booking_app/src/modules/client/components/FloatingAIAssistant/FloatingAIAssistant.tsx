import { useState } from "react";
import { Button, Tooltip, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import chatBotAi from "@/assets/lotties/Chatbot.json";
import Lottie from "lottie-react";

const FloatingAIAssistant = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/ai");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "20px",
        zIndex: 1000,
      }}
    >
      <Tooltip
        title="Trợ lý AI MediCare - Hỏi về sức khỏe, đặt lịch, tìm bác sĩ"
        placement="left"
        color="linear-gradient(135deg, #4F4F4F 0%, #B5B5B5 100%)"
      >
        <Badge
          count="AI"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: isHovered ? "white" : "black",
            background: isHovered ? "black" : "#D3D3D3",
          }}
          offset={[-5, 5]}
        >
          <Button
            shape="circle"
            size="large"
            icon={
              <Lottie
                animationData={chatBotAi}
                style={{ width: 50, height: 50 }}
              />
            }
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: 64,
              height: 64,
              backgroundColor: isHovered ? "#B5B5B5" : "#D3D3D3",
              border: isHovered ? "1px solid #696969" : "",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "background-color 0.2s ease, box-shadow 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
              overflow: "hidden",
            }}
          />
        </Badge>
      </Tooltip>
    </div>
  );
};

export default FloatingAIAssistant;
