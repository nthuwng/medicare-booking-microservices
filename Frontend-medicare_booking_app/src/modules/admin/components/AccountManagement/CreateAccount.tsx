import {
  App,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Row,
  Col,
  InputNumber,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import {
  getAllClinics,
  getAllSpecialties,
  createOneUserAPI,
  uploadFileAPI,
} from "../../services/admin.api";
import type { IClinicTable, ISpecialty } from "@/types";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import type { UploadFile } from "antd/es/upload/interface";
import {
  LoadingOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface IProps {
  openModalAdd: boolean;
  setOpenModalAdd: (v: boolean) => void;
  refreshTable: () => void;
}

const { Option } = Select;

const sectionStyle: React.CSSProperties = {
  marginBottom: 20,
  padding: 16,
  borderRadius: 12,
  background: "#fafafa",
  border: "1px solid #f0f0f0",
};

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 16,
  marginBottom: 12,
};

const CreateAccount = (props: IProps) => {
  const { openModalAdd, setOpenModalAdd, refreshTable } = props;
  const { notification, message } = App.useApp();

  const [isSubmit, setIsSubmit] = useState(false);
  const [clinics, setClinics] = useState<IClinicTable[]>([]);
  const [specialties, setSpecialties] = useState<ISpecialty[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [form] = Form.useForm();
  const userType = Form.useWatch("userType", form);

  const fetchClinics = async () => {
    try {
      const res = await getAllClinics(`page=1&pageSize=100`);
      if (res.success === true) {
        setClinics(res?.data?.result as IClinicTable[]);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await getAllSpecialties(`page=1&pageSize=100`);
      if (res.success === true) {
        setSpecialties(res?.data?.result as ISpecialty[]);
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
    }
  };

  useEffect(() => {
    if (openModalAdd) {
      fetchClinics();
      fetchSpecialties();
    }
  }, [openModalAdd]);

  // =========================
  // Upload avatar -> Cloudinary
  // =========================
  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess, onError, file } = options;

    try {
      setLoadingUpload(true);
      const res = await uploadFileAPI(file as File);

      if (res && res.data) {
        const uploadedFile: UploadFile = {
          uid: (file as any).uid,
          name: res.data.public_id,
          status: "done",
          url: res.data.url,
        };

        setFileList([uploadedFile]);

        onSuccess?.(res.data, file as any);
      } else {
        message.error(res.message || "Upload thất bại");
        onError?.(new Error(res.message));
      }
    } catch (error: any) {
      message.error(error.message || "Upload thất bại");
      onError?.(error);
    } finally {
      setLoadingUpload(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleRemove = () => {
    setFileList([]);
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async (values: any) => {
    setIsSubmit(true);
    try {
      const { userType } = values;

      let payload: any;

      let avatar_url = "";
      let avatar_public_id = "";

      if (fileList.length > 0 && fileList[0].url) {
        avatar_url = fileList[0].url!;
        avatar_public_id = fileList[0].name || "";
      }

      if (userType === "DOCTOR") {
        payload = {
          email: values.email,
          password: values.password,
          userType: "DOCTOR",
          fullName: values.fullName,
          clinicId: values.clinicId,
          specialtyId: values.specialtyId,
          phone: values.phone,
          bio: values.bio,
          experienceYears:
            values.experienceYears !== undefined &&
            values.experienceYears !== null
              ? Number(values.experienceYears)
              : undefined,
          bookingFee:
            values.bookingFee !== undefined && values.bookingFee !== null
              ? Number(values.bookingFee)
              : undefined,
          title: values.title,
          gender: values.gender,
          avatarUrl: avatar_url,
          avatarPublicId: avatar_public_id,
          approvalStatus: values.approvalStatus,
        };
      } else {
        // PATIENT / ADMIN: chỉ cần email + password + userType
        payload = {
          email: values.email,
          password: values.password,
          userType,
          fullName: values.fullName,
          phone: values.phone,
          avatarUrl: avatar_url,
        };
      }

      const res = await createOneUserAPI(payload);

      if (res.success === true) {
        notification.success({
          message: "Thêm người dùng thành công",
          description: res.message || "Đã tạo thành công 1 người dùng.",
          duration: 4,
        });
        setOpenModalAdd(false);
        form.resetFields();
        setFileList([]);
        refreshTable();
      } else {
        notification.error({
          message: "Thêm người dùng thất bại",
          description: res.data?.detail || "Có lỗi xảy ra.",
          duration: 6,
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi thêm người dùng. Vui lòng thử lại.",
        duration: 4,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    setOpenModalAdd(false);
    form.resetFields();
    setFileList([]);
  };

  const isDoctor = userType === "DOCTOR";

  return (
    <Modal
      title="Thêm mới người dùng"
      open={openModalAdd}
      onCancel={handleClose}
      footer={null}
      width={"60vw"}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          userType: "PATIENT",
          approvalStatus: "Pending",
        }}
        style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}
      >
        {/* ===== TÀI KHOẢN ===== */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Thông tin tài khoản</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="nhapemail@domain.com" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password placeholder="Tối thiểu 6 ký tự" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="top">
            <Col xs={24} md={12}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="userType"
                    label="Loại người dùng"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại người dùng!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn loại người dùng"
                      allowClear
                      size="large"
                    >
                      <Option value="PATIENT">Bệnh nhân</Option>
                      <Option value="DOCTOR">Bác sĩ</Option>
                      <Option value="ADMIN">Admin</Option>
                    </Select>
                  </Form.Item>
                </Col>
                {isDoctor && (
                  <Col span={24}>
                    <Form.Item
                      name="approvalStatus"
                      label="Trạng thái duyệt"
                    >
                      <Select
                        placeholder="Chọn trạng thái"
                        allowClear
                        size="large"
                      >
                        <Option value="Pending">Chờ duyệt</Option>
                        <Option value="Approved">Đã duyệt</Option>
                        <Option value="Rejected">Từ chối</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Ảnh đại diện" name="avatar_url">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  customRequest={handleUploadFile}
                  beforeUpload={beforeUpload}
                  onRemove={handleRemove}
                  fileList={fileList}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      {loadingUpload ? <LoadingOutlined /> : <UploadOutlined />}
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ===== THÔNG TIN CÁ NHÂN ===== */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Thông tin cá nhân</div>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input
                  placeholder="Nhập họ và tên đầy đủ"
                  prefix={<UserOutlined className="text-gray-400" />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ===== THÔNG TIN BÁC SĨ ===== */}
        {isDoctor && (
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Thông tin bác sĩ</div>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="specialtyId"
                  label="Chuyên khoa"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn chuyên khoa!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn chuyên khoa"
                    size="large"
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={specialties.map((specialty) => ({
                      value: specialty.id,
                      label: specialty.specialtyName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clinicId"
                  label="Phòng khám"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn phòng khám!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn phòng khám"
                    size="large"
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={clinics.map((clinic) => ({
                      value: clinic.id,
                      label: clinic.clinicName,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn giới tính"
                    size="large"
                    options={[
                      { value: "Male", label: "Nam" },
                      { value: "Female", label: "Nữ" },
                      { value: "Other", label: "Khác" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Học vị"
                  rules={[
                    { required: true, message: "Vui lòng chọn học vị!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn học vị"
                    size="large"
                    options={[
                      { value: "BS", label: "Bác sĩ" },
                      { value: "ThS", label: "Thạc sĩ" },
                      { value: "TS", label: "Tiến sĩ" },
                      { value: "PGS", label: "Phó Giáo sư" },
                      { value: "GS", label: "Giáo sư" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="experienceYears" label="Số năm kinh nghiệm">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="VD: 5"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="bookingFee" label="Phí đặt lịch (VNĐ)">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="VD: 150000"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={24}>
                <Form.Item name="bio" label="Giới thiệu">
                  <Input.TextArea
                    rows={3}
                    placeholder="Mô tả ngắn về bản thân / kinh nghiệm"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        <Form.Item style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              borderTop: "1px solid #f0f0f0",
              paddingTop: 16,
            }}
          >
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isSubmit}>
              Thêm mới
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAccount;
