import { useEffect, useState } from "react";
import { getDoctorProfileByUserId } from "../services/doctor.api";
import { useCurrentApp } from "@/components/contexts/app.context";
import type { IDoctorProfile } from "@/types";
import { Button, Empty, Tag, Card, Modal, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface IProps {
  children: React.ReactNode;
}

const DoctorWaitingApproval = (props: IProps) => {
  const { user } = useCurrentApp();
  const [doctorWaitingApproval, setDoctorWaitingApproval] =
    useState<IDoctorProfile | null>(null);
  const [isNull, setIsNull] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorWaitingApproval = async () => {
      const res = await getDoctorProfileByUserId(user?.id as string);
      if (res?.data) {
        setDoctorWaitingApproval(res.data);
      } else {
        setIsNull(true);
      }
    };

    fetchDoctorWaitingApproval();
  }, [user?.id]);

  if (
    doctorWaitingApproval?.approvalStatus === "Pending" ||
    doctorWaitingApproval?.approvalStatus === "Rejected" ||
    isNull
  ) {
    return (
      <>
        {isNull && (
          <div className="min-h-[84vh] flex items-center justify-center">
            <Card className="w-full max-w-xl border rounded-xl shadow-sm">
              <div className="p-8 text-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={false}
                />
                <Title level={4} className="mt-4 mb-1 !text-[20px]">
                  Không có hồ sơ bác sĩ
                </Title>
                <Text type="secondary" className="!text-[16px]">
                  Bạn chưa có hồ sơ. Hãy tạo hồ sơ để bắt đầu sử dụng các tính
                  năng dành cho bác sĩ.
                </Text>
              </div>
              <div className="flex items-center justify-center ">
                <Button
                  type="primary"
                  onClick={() => navigate("/doctor/profile-settings")}
                  className="!w-[50%] !text-[16px]"
                >
                  Tạo hồ sơ
                </Button>
              </div>
            </Card>
          </div>
        )}
        <div className="min-h-[84vh] flex items-center justify-center">
          <Card className="w-full max-w-xl border rounded-xl shadow-sm">
            <div className="p-8 text-center">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
              <Title level={4} className="mt-4 mb-1">
                Hồ sơ đang chờ duyệt
              </Title>
              <Text type="secondary">
                Hồ sơ của bạn có trạng thái:{" "}
                <Tag
                  color={
                    doctorWaitingApproval?.approvalStatus === "Rejected"
                      ? "red"
                      : "gold"
                  }
                >
                  {doctorWaitingApproval?.approvalStatus}
                </Tag>
              </Text>
              {doctorWaitingApproval?.approvalStatus === "Rejected" && (
                <div className="mt-4">
                  <Text type="secondary">
                    Vui lòng cập nhật lại thông tin và gửi yêu cầu duyệt.
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </div>
      </>
    );
  }

  return <>{props.children}</>;
};

export default DoctorWaitingApproval;
