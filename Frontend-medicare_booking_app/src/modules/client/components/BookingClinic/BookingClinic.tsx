import { Card, Avatar, Row, Col, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { IClinic } from "@/types";

const { Title, Text } = Typography;

type BookingClinicProps = {
  dataClinics: IClinic[];
  setDataClinics: (clinics: IClinic[]) => void;
  searchText?: string;
};

const BookingClinic = (props: BookingClinicProps) => {
  const { dataClinics } = props;
  const navigate = useNavigate();

  const handleViewDoctors = (clinic: IClinic) => {
    navigate(
      `/booking-options/doctor?clinicId=${
        clinic.id
      }&clinicName=${encodeURIComponent(clinic.clinicName)}`
    );
  };

  return (
    <>
      {dataClinics.length > 0 && (
        <Row gutter={[24, 24]}>
          {dataClinics.map((clinic) => (
            <Col key={clinic.id} xs={24} md={12}>
              <Card
                className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm cursor-pointer"
                onClick={() => handleViewDoctors(clinic)}
                bodyStyle={{ padding: "20px" }}
              >
                <div className="flex items-center gap-5">
                  <Avatar
                    size={104}
                    src={clinic.iconPath || undefined}
                    style={{
                      backgroundImage: !clinic.iconPath
                        ? "linear-gradient(135deg, #1890ff, #096dd9)"
                        : undefined,
                      color: "#fff",
                      fontSize: "42px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "4px solid #ffffff",
                      boxShadow: "0 6px 20px rgba(24, 144, 255, 0.25)",
                    }}
                  >
                    {!clinic.iconPath &&
                      clinic.clinicName?.charAt(0).toUpperCase()}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <Title level={4} className="!mb-1 !text-gray-800">
                      {clinic.clinicName}
                    </Title>
                    <Text className="text-gray-500">
                      Xem bác sĩ theo phòng khám
                    </Text>
                  </div>

                  <RightOutlined className="text-gray-400" />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default BookingClinic;
