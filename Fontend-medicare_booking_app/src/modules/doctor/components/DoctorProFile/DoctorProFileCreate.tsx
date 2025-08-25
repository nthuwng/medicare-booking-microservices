import {
  Form,
  Modal,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  message,
  App,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  UploadOutlined,
  UserOutlined,
  PhoneOutlined,
  TrophyOutlined,
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import {
  createDoctorProfile,
  getAllClinics,
  getAllSpecialtiesDoctorProFile,
  uploadFileAPI,
} from "../../services/doctor.api";
import type { IClinic, ISpecialty } from "@/types";
import type { FormProps } from "antd/lib";

const { TextArea } = Input;
const { Title } = Typography;

interface IProps {
  openCreate: boolean;
  setOpenCreate: (open: boolean) => void;
  fetchDoctorProfile: () => void;
}

type FieldType = {
  fullName: string;
  phone: string;
  gender: string;
  title: string;
  experienceYears: number;
  avatar_url: string;
  specialtyId: string;
  clinicId: string;
  bookingFee: number;
  consultationFee: number;
  avatar_public_id: string;
  bio: string;
};

const DoctorProFileCreate = (props: IProps) => {
  const { openCreate, setOpenCreate, fetchDoctorProfile } = props;
  const [form] = Form.useForm();
  const [specialties, setSpecialties] = useState<ISpecialty[]>([]);
  const [clinics, setClinics] = useState<IClinic[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();

  // Fetch specialties and clinics
  useEffect(() => {
    if (openCreate) {
      fetchSpecialties();
      fetchClinics();
    }
  }, [openCreate]);

  const fetchSpecialties = async () => {
    try {
      const res = await getAllSpecialtiesDoctorProFile();
      if (res.data) {
        setSpecialties(res?.data.result as ISpecialty[]);
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await getAllClinics();
      if (res.data) {
        setClinics(res?.data.result as IClinic[]);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
    }
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const {
      fullName,
      phone,
      gender,
      title,
      experienceYears,
      specialtyId,
      clinicId,
      bookingFee,
      consultationFee,
      bio,
    } = values;
    setIsSubmit(true);

    try {
      // Lấy thông tin file đã upload
      let avatar_url = "";
      let avatar_public_id = "";

      if (fileList.length > 0 && fileList[0].url) {
        avatar_url = fileList[0].url;
        avatar_public_id = fileList[0].name || "";
      }

      const res = await createDoctorProfile(
        fullName,
        phone,
        gender,
        title,
        experienceYears,
        avatar_url,
        specialtyId,
        clinicId,
        bookingFee,
        consultationFee,
        bio,
        avatar_public_id
      );

      if (res && res.data) {
        notification.success({
          message: "Tạo mới hồ sơ bác sĩ thành công",
          placement: "top",
          duration: 5,
          style: {
            fontSize: "16px",
          },
          description: "Vui lòng chờ admin phê duyệt",
        });
        form.resetFields();
        setFileList([]);
        setOpenCreate(false);
        fetchDoctorProfile?.();
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res.message,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo hồ sơ bác sĩ",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setLoadingUpload(false);
    setOpenCreate(false);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return true;
  };

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess, onError, file } = options;

    try {
      setLoadingUpload(true);
      const res = await uploadFileAPI(file);

      if (res && res.data) {
        const uploadedFile: any = {
          uid: (file as any).uid,
          name: res.data.public_id,
          status: "done",
          url: res.data.url,
        };

        setFileList([{ ...uploadedFile }]);
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

  const handleRemove = () => {
    setFileList([]);
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <span
            className="text-lg font-semibold w-full flex justify-center items-center"
            style={{
              fontSize: "1.5rem",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: "700",
            }}
          >
            Tạo hồ sơ bác sĩ
          </span>
        </div>
      }
      open={openCreate}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      destroyOnClose={true}
      okText="Tạo mới"
      cancelText="Hủy"
      width="60vw"
      maskClosable={false}
      confirmLoading={isSubmit}
      className="doctor-profile-create-modal"
      okButtonProps={{
        size: "large",
        style: { minWidth: 100, height: 45, fontSize: 18, borderRadius: 10 },
      }}
      cancelButtonProps={{
        size: "large",
        style: { minWidth: 100, height: 45, fontSize: 18, borderRadius: 10 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          experienceYears: 0,
          consultationFee: 0,
          bookingFee: 0,
        }}
      >
        {/* Personal Information Section */}
        <div>
          <Title level={4} className="flex items-center mb-4">
            <UserOutlined className="mr-2 text-blue-600" />
            Thông tin cá nhân
          </Title>

          <Row gutter={[16, 16]}>
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
                rules={[{ required: true, message: "Vui lòng chọn học vị!" }]}
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

            <Col xs={24} md={12}>
              <Form.Item
                name="experienceYears"
                label="Số năm kinh nghiệm"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số năm kinh nghiệm!",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Nhập số năm kinh nghiệm"
                  min={0}
                  max={50}
                  className="w-full"
                  size="large"
                  prefix={<CalendarOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="avatar_url" label="Ảnh đại diện">
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
                      <div className="mt-2">Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Professional Information Section */}
        <div className="mb-6">
          <Title level={4} className="flex items-center mb-4">
            <TrophyOutlined className="mr-2 text-green-600" />
            Thông tin chuyên môn
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="specialtyId"
                label="Chuyên khoa"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên khoa!" },
                ]}
              >
                <Select
                  placeholder="Chọn chuyên khoa"
                  size="large"
                  showSearch
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
                  { required: true, message: "Vui lòng chọn phòng khám!" },
                ]}
              >
                <Select
                  placeholder="Chọn phòng khám"
                  size="large"
                  showSearch
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
        </div>

        <Divider />

        {/* Financial Information Section */}
        <div className="mb-6">
          <Title level={4} className="flex items-center mb-4">
            <DollarOutlined className="mr-2 text-yellow-600" />
            Thông tin phí khám
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="bookingFee"
                label="Phí đặt lịch (VND)"
                rules={[
                  { required: true, message: "Vui lòng nhập phí đặt lịch!" },
                ]}
              >
                <InputNumber
                  placeholder="Nhập phí đặt lịch"
                  min={0}
                  className="!w-[200px]"
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  prefix={<DollarOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="consultationFee" label="Phí tư vấn (VND)">
                <InputNumber
                  placeholder="Nhập phí tư vấn"
                  min={0}
                  className="!w-[200px]"
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  prefix={<DollarOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Bio Section */}
        <div className="mb-6">
          <Title level={4} className="flex items-center mb-4">
            <FileTextOutlined className="mr-2 text-purple-600" />
            Giới thiệu
          </Title>

          <Form.Item
            name="bio"
            label="Tiểu sử và kinh nghiệm"
            rules={[{ required: true, message: "Vui lòng nhập tiểu sử!" }]}
          >
            <TextArea
              placeholder="Nhập tiểu sử, kinh nghiệm chuyên môn, chuyên khoa chính..."
              rows={6}
              showCount
              maxLength={1000}
              className="resize-none"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default DoctorProFileCreate;
