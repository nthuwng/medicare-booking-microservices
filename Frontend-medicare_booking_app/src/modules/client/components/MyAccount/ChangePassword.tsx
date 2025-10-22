import { Modal, Form, Input, Button, Space, App } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { putUpdatePasswordApi } from "../../services/client.api";
import { useCurrentApp } from "@/components/contexts/app.context";

interface props {
  passwordModalOpen: boolean;
  setPasswordModalOpen: (open: boolean) => void;
}

const ChangePassword = (props: props) => {
  const { passwordModalOpen, setPasswordModalOpen } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useCurrentApp();
  const { message } = App.useApp();

  const handleSubmit = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);
      const response = await putUpdatePasswordApi(
        values.oldPassword,
        values.newPassword,
        values.confirmPassword,
        user?.id || ""
      );

      if (response?.success === true) {
        message.success(response?.message || "Đổi mật khẩu thành công!");
        form.resetFields();
        setPasswordModalOpen(false);
      } else {
        message.error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPasswordModalOpen(false);
  };

  return (
    <Modal
      open={passwordModalOpen}
      onCancel={handleCancel}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LockOutlined style={{ color: "#1890ff" }} />
          <span>Đổi mật khẩu</span>
        </div>
      }
      footer={null}
      width={500}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: "20px" }}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu hiện tại"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message:
                "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!",
            },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: "30px" }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              size="large"
              onClick={handleCancel}
              style={{ minWidth: "100px" }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ minWidth: "100px" }}
            >
              Đổi mật khẩu
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;
