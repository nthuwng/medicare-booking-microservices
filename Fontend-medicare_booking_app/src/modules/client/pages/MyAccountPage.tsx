import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Tag,
  Typography,
} from "antd";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useCurrentApp } from "@/components/contexts/app.context";

const { Title, Text } = Typography;

const MyAccountPage = () => {
  const { user } = useCurrentApp();

  const fullName = "Người dùng";
  const email = "—";
  const phone = (user as any)?.phone || "—";
  const gender = (user as any)?.patientGender as string | undefined;
  const dob = (user as any)?.dateOfBirth as string | undefined;
  const city = (user as any)?.city as string | undefined;
  const district = (user as any)?.district as string | undefined;
  const street = (user as any)?.street as string | undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Card className="shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              size={72}
              src={(user as any)?.avatarUrl}
              icon={<UserOutlined />}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Title level={4} style={{ margin: 0 }}>
                  {fullName}
                </Title>
                <Tag color="blue-inverse">Tài khoản</Tag>
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MailOutlined /> {email}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneOutlined /> {phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-gray-500 text-xs">Trạng thái</div>
              <Tag color="green">Đang hoạt động</Tag>
            </div>
            <Button type="primary">Chỉnh sửa hồ sơ</Button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Thông tin cá nhân">
          <Descriptions column={1} size="middle">
            <Descriptions.Item label="Họ tên">{fullName}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {gender === "Male" ? "Nam" : gender === "Female" ? "Nữ" : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {dob ? dayjs(dob).format("DD/MM/YYYY") : "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Liên hệ">
          <Descriptions column={1} size="middle">
            <Descriptions.Item label="Email">{email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{phone}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Địa chỉ" className="md:col-span-2">
          <Descriptions column={2} size="middle" bordered>
            <Descriptions.Item label="Đường">{street || "—"}</Descriptions.Item>
            <Descriptions.Item label="Quận/Huyện">
              {district || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Thành phố">
              {city || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã bưu chính">—</Descriptions.Item>
          </Descriptions>
          <Divider className="my-4" />
          <Flex justify="end">
            <Button>Chỉnh sửa địa chỉ</Button>
          </Flex>
        </Card>

        <Card title="Bảo mật">
          <Text type="secondary">
            Bạn có thể đổi mật khẩu để bảo vệ tài khoản tốt hơn.
          </Text>
          <div className="mt-3">
            <Button type="primary">Đổi mật khẩu</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyAccountPage;
