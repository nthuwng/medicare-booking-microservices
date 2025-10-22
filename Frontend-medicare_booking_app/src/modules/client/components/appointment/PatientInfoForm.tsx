import { Card, Typography, Row, Col, Form, Input, Select, Radio } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

const { Title, Text } = Typography;
// const { Option } = Select; // unused
const { TextArea } = Input;

interface IProps {
  bookingFor: string;
}

const PatientInfoForm = (props: IProps) => {
  const { bookingFor } = props;
  // Vietnam provinces/districts via public API
  type TDistrict = { code: number; name: string };
  type TProvince = { code: number; name: string; districts: TDistrict[] };

  const [provinces, setProvinces] = useState<TProvince[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [selectedCityName, setSelectedCityName] = useState<string | undefined>(
    undefined
  );
  const form = Form.useFormInstance();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingLocations(true);
        const res = await fetch("https://provinces.open-api.vn/api/?depth=2");
        const data: TProvince[] = await res.json();
        setProvinces(Array.isArray(data) ? data : []);
      } catch (e) {
        setProvinces([]);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchProvinces();
  }, []);

  const selectedProvince = useMemo(() => {
    if (!selectedCityName) return undefined;
    return provinces.find((p) => p.name === selectedCityName);
  }, [provinces, selectedCityName]);

  const handleCityChange = (value: string) => {
    setSelectedCityName(value);
    if (form) form.setFieldsValue({ province: value, district: undefined });
  };

  const currentYear = new Date().getFullYear();
  return (
    <>
      <Card
        style={{
          borderRadius: "16px",
          border: "2px solid #e6f7ff",
          backgroundColor: "#fafcff",
          boxShadow: "0 4px 12px rgba(24, 144, 255, 0.1)",
          marginBottom: "24px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            {bookingFor === "self" ? (
              <UserOutlined
                style={{
                  fontSize: "20px",
                  color: "#1890ff",
                  marginRight: "8px",
                }}
              />
            ) : (
              <UserOutlined
                style={{
                  fontSize: "20px",
                  color: "#1890ff",
                  marginRight: "8px",
                }}
              />
            )}
            <Title level={5} style={{ margin: 0, color: "#1890ff" }}>
              {bookingFor === "self"
                ? "Thông tin của bạn"
                : "Thông tin bệnh nhân"}
            </Title>
          </div>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Vui lòng nhập đầy đủ thông tin để chúng tôi có thể liên hệ và xác
            nhận lịch khám
          </Text>
        </div>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Họ tên bệnh nhân</Text>}
              name="patientName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ tên!",
                },
                {
                  whitespace: true,
                  message: "Họ tên không được chỉ chứa khoảng trắng!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập họ tên bệnh nhân"
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Giới tính</Text>}
              name="gender"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn giới tính!",
                },
              ]}
            >
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Số điện thoại liên hệ</Text>}
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại!",
                },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
                {
                  whitespace: true,
                  message: "Số điện thoại không được để trống!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập số điện thoại"
                prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Địa chỉ email</Text>}
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
                { whitespace: true, message: "Email không được để trống!" },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập địa chỉ email"
                prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={<Text strong>Năm sinh</Text>}
          name="dateOfBirth"
          rules={[
            { required: true, message: "Vui lòng nhập năm sinh!" },
            {
              pattern: /^\d{4}$/,
              message: "Năm sinh phải gồm 4 chữ số (ví dụ: 1990)",
            },
            () => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                const yearNum = Number(String(value).trim());
                if (Number.isNaN(yearNum))
                  return Promise.reject("Năm sinh không hợp lệ!");
                if (yearNum < 1900 || yearNum > currentYear) {
                  return Promise.reject(
                    `Năm sinh phải trong khoảng 1900-${currentYear}`
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập năm sinh (ví dụ: 1990)"
            prefix={<CalendarOutlined style={{ color: "#bfbfbf" }} />}
          />
        </Form.Item>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Tỉnh/Thành phố</Text>}
              name="province"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn tỉnh/thành!",
                },
              ]}
            >
              <Select
                showSearch
                size="large"
                placeholder="-- Chọn Tỉnh/Thành --"
                loading={loadingLocations}
                optionFilterProp="label"
                onChange={handleCityChange}
                options={provinces.map((p) => ({
                  label: p.name,
                  value: p.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>Quận/Huyện</Text>}
              name="district"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn quận/huyện!",
                },
              ]}
            >
              <Select
                showSearch
                size="large"
                placeholder="-- Chọn Quận/Huyện --"
                optionFilterProp="label"
                disabled={!selectedProvince}
                options={(selectedProvince?.districts || []).map((d) => ({
                  label: d.name,
                  value: d.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={<Text strong>Địa chỉ</Text>}
          name="address"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ!" },
            {
              whitespace: true,
              message: "Địa chỉ không được chỉ chứa khoảng trắng!",
            },
          ]}
        >
          <Input
            size="large"
            placeholder="Nhập số nhà, tên đường..."
            prefix={<EnvironmentOutlined style={{ color: "#bfbfbf" }} />}
          />
        </Form.Item>

        <Form.Item label={<Text strong>Lý do khám</Text>} name="reason">
          <TextArea
            rows={4}
            placeholder="Mô tả triệu chứng, lý do khám bệnh..."
            maxLength={400}
            showCount
          />
        </Form.Item>
      </Card>
    </>
  );
};

export default PatientInfoForm;
