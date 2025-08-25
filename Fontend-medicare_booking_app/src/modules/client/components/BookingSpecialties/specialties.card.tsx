import React from "react";
import { Card, Avatar, Row, Col, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ISpecialty } from "@/types";

const { Title, Text } = Typography;

type SpecialtiesCardProps = {
  dataSpecialties: ISpecialty[];
  setDataSpecialties: (specialties: ISpecialty[]) => void;
  searchText?: string;
};

const SpecialtiesCard = (props: SpecialtiesCardProps) => {
  const { dataSpecialties } = props;
  const navigate = useNavigate();

  const handleViewDoctors = (specialty: ISpecialty) => {
    navigate(
      `/booking-options/doctor?specialtyId=${
        specialty.id
      }&specialtyName=${encodeURIComponent(specialty.specialtyName)}`
    );
  };

  return (
    <>
      {dataSpecialties.length > 0 && (
        <Row gutter={[24, 24]}>
          {dataSpecialties.map((specialty) => (
            <Col key={specialty.id} xs={24} sm={12} md={12} lg={6} xl={6}>
              <Card
                className="transition-all duration-300 border-0 shadow-sm hover:shadow-md cursor-pointer rounded-2xl"
                onClick={() => handleViewDoctors(specialty)}
                bodyStyle={{ padding: "12px 12px 16px 12px" }}
              >
                <div className="flex flex-col">
                  {/* Image box */}
                  <div className="w-full h-36 md:h-40 rounded-xl bg-gradient-to-b from-[#fff9f0] to-[#f3f9ff] flex items-center justify-center overflow-hidden">
                    {specialty.iconPath ? (
                      <img
                        src={specialty.iconPath}
                        alt={specialty.specialtyName}
                        className="max-h-28 md:max-h-32 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center text-xl font-semibold">
                        {specialty.specialtyName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mt-3">
                    <Title
                      level={5}
                      className="!m-0 !text-gray-900 !font-semibold"
                    >
                      {specialty.specialtyName}
                    </Title>
                    <Text className="text-gray-500">
                      Xem bác sĩ theo chuyên khoa
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default SpecialtiesCard;
