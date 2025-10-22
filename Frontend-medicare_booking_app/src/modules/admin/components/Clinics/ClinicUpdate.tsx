import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  Select,
  Upload,
  App,
  Image,
  Typography,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import type { FormProps, GetProp, UploadProps, UploadFile } from "antd";

import { updateClinics, uploadFileAPI } from "../../services/admin.api";
import {
  LoadingOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

const { Title, Text } = Typography;

interface IProps {
  openModalUpdate: boolean;
  setOpenModalUpdate: (v: boolean) => void;
  refreshTable: () => void;
  dataClinic: IClinic | null;
}

type FieldType = {
  clinic_name: string;
  city: string;
  district: string;
  street: string;
  phone: string;
  description: string;
  icon: string;
};

export interface IClinic {
  id: number | string;
  clinic_name: string;
  city: string;
  district: string;
  street: string;
  phone: string;
  description: string;
  icon_path?: string;
  icon_public_id?: string;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const ClinicUpdate = (props: IProps) => {
  const { openModalUpdate, setOpenModalUpdate, refreshTable, dataClinic } =
    props;
  const [form] = Form.useForm<FieldType>();
  const { message, notification } = App.useApp();

  const [isSubmit, setIsSubmit] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);

  const [loadingIcon, setLoadingIcon] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [fileListIcon, setFileListIcon] = useState<UploadFile[]>([]);

  const cityDistrictData: Record<string, string[]> = {
    HoChiMinh: [
      "Quận 1",
      "Quận 2",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 9",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận Bình Thạnh",
      "Quận Tân Bình",
      "Thủ Đức",
      "Quận Gò Vấp",
      "Quận Bình Tân",
    ],
    Hanoi: [
      "Ba Đình",
      "Hoàn Kiếm",
      "Đống Đa",
      "Cầu Giấy",
      "Thanh Xuân",
      "Hai Bà Trưng",
      "Tây Hồ",
    ],
  };

  useEffect(() => {
    if (!openModalUpdate) return;

    if (dataClinic) {
      // set quận/huyện theo city
      const selectedDistricts = cityDistrictData[dataClinic.city] || [];
      setDistricts(selectedDistricts);

      // fill form
      form.setFieldsValue({
        clinic_name: dataClinic.clinic_name,
        city: dataClinic.city,
        district: dataClinic.district,
        street: dataClinic.street,
        phone: dataClinic.phone,
        description: dataClinic.description,
      });

      // set icon sẵn nếu có
      if (dataClinic.icon_path) {
        setFileListIcon([
          {
            uid: "-1",
            name: "icon",
            status: "done",
            url: dataClinic.icon_path,
          },
        ]);
      } else {
        setFileListIcon([]);
      }
    } else {
      form.resetFields();
      setDistricts([]);
      setFileListIcon([]);
    }
  }, [openModalUpdate, dataClinic, form]);

  const handleCityChange = (value: string) => {
    const selectedDistricts = cityDistrictData[value] || [];
    setDistricts(selectedDistricts);
    form.setFieldsValue({ district: undefined });
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (!dataClinic?.id) {
      notification.error({
        message: "Thiếu dữ liệu",
        description: "Không tìm thấy ID phòng khám để cập nhật.",
      });
      return;
    }
    const { clinic_name, city, district, street, phone, description } = values;
    setIsSubmit(true);

    try {
      // mặc định giữ icon cũ
      let iconPath = dataClinic.icon_path || "";
      let iconPublicId = dataClinic.icon_public_id || "";

      // nếu có upload mới
      if (fileListIcon.length > 0 && fileListIcon[0].url) {
        iconPath = fileListIcon[0].url as string;
        iconPublicId = (fileListIcon[0].name as string) || iconPublicId;
      } else if (fileListIcon.length === 0) {
        // user xoá icon
        iconPath = "";
        iconPublicId = "";
      }

      const res = await updateClinics(
        Number(dataClinic.id),
        clinic_name,
        city,
        district,
        street,
        phone,
        description,
        iconPath,
        iconPublicId
      );
      if (res && res.data) {
        message.success("Cập nhật phòng khám thành công");
        setOpenModalUpdate(false);
        refreshTable?.();
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res?.message || "Không thể cập nhật phòng khám",
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error?.message || "Có lỗi xảy ra khi cập nhật phòng khám",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) message.error("Chỉ hỗ trợ file JPG/PNG!");
    const isLt2M = file.size / 1024 / 1024 < MAX_UPLOAD_IMAGE_SIZE;
    if (!isLt2M)
      message.error(`Kích thước ảnh phải nhỏ hơn ${MAX_UPLOAD_IMAGE_SIZE}MB!`);
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };


  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") setLoadingIcon(true);
    if (info.file.status === "done" || info.file.status === "error") {
      setLoadingIcon(false);
    }
  };

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    const res = await uploadFileAPI(file);

    if (res && res.data) {
      const uploadedFile: UploadFile = {
        uid: (file as any).uid,
        name: res.data.public_id,
        status: "done",
        url: res.data.url,
      };
      setFileListIcon([uploadedFile]);
      onSuccess?.(res.data, file as any);
    } else {
      message.error(res?.message || "Upload thất bại");
      setLoadingIcon(false);
    }
  };


  console.log("fileListIcon", fileListIcon);

  return (
    <>
      <Modal
        title={
          <Space
            align="center"
            style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}
          >
            <BankOutlined />
            Cập nhật phòng khám
          </Space>
        }
        open={openModalUpdate}
        onOk={() => form.submit()}
        onCancel={() => {
          form.resetFields();
          setFileListIcon([]);
          setOpenModalUpdate(false);
        }}
        forceRender
        destroyOnClose
        okButtonProps={{ loading: isSubmit, size: "large" }}
        cancelButtonProps={{ loading: isSubmit, size: "large" }}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={900}
        maskClosable={false}
        confirmLoading={isSubmit}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "75vh",
            overflowY: "auto",
            padding: "24px",
            paddingBottom: "16px",
          },
          header: { paddingBottom: "16px", marginBottom: "0px" },
        }}
      >
        <Form<FieldType>
          form={form}
          name="form-update-clinic" // ✅ đổi tên form
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          {/* Thông tin cơ bản */}
          <div
            style={{
              backgroundColor: "#f8fcff",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #e8f4f8",
              marginBottom: "24px",
            }}
          >
            <Title level={5} style={{ color: "#1890ff", marginBottom: 16 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Thông tin cơ bản
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item<FieldType>
                  label={<Text strong>Tên phòng khám</Text>}
                  name="clinic_name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên phòng khám!",
                    },
                    {
                      min: 3,
                      message: "Tên phòng khám phải có ít nhất 3 ký tự!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên phòng khám"
                    size="large"
                    prefix={<BankOutlined style={{ color: "#bfbfbf" }} />}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item<FieldType>
                  label={<Text strong>Số điện thoại</Text>}
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại liên hệ"
                    size="large"
                    prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Địa chỉ */}
          <div
            style={{
              backgroundColor: "#f6ffed",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #e8f5e8",
              marginBottom: "24px",
            }}
          >
            <Title level={5} style={{ color: "#52c41a", marginBottom: 16 }}>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              Địa chỉ phòng khám
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <Form.Item<FieldType>
                  label={<Text strong>Thành phố</Text>}
                  name="city"
                  rules={[
                    { required: true, message: "Vui lòng chọn thành phố!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn thành phố"
                    size="large"
                    onChange={handleCityChange}
                    options={[
                      { label: "🏙️ Hồ Chí Minh", value: "HoChiMinh" },
                      { label: "🏛️ Hà Nội", value: "Hanoi" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item<FieldType>
                  label={<Text strong>Quận/Huyện</Text>}
                  name="district"
                  rules={[
                    { required: true, message: "Vui lòng chọn quận/huyện!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn quận/huyện"
                    size="large"
                    options={districts.map((item) => ({
                      label: item,
                      value: item,
                    }))}
                    disabled={districts.length === 0}
                    notFoundContent={
                      districts.length === 0
                        ? "Vui lòng chọn thành phố trước"
                        : "Không có dữ liệu"
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item<FieldType>
                  label={<Text strong>Địa chỉ chi tiết</Text>}
                  name="street"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ chi tiết!",
                    },
                    { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập số nhà, tên đường..."
                    size="large"
                    prefix={
                      <EnvironmentOutlined style={{ color: "#bfbfbf" }} />
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Mô tả & Hình ảnh */}
          <div
            style={{
              backgroundColor: "#fff2e8",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #fff1f0",
              marginBottom: "16px",
            }}
          >
            <Title level={5} style={{ color: "#fa8c16", marginBottom: 16 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Thông tin bổ sung
            </Title>

            <Row gutter={[24, 16]}>
              <Col xs={24} lg={16}>
                <Form.Item<FieldType>
                  label={<Text strong>Mô tả phòng khám</Text>}
                  name="description"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả!" },
                    { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Mô tả về phòng khám, dịch vụ, tiện ích..."
                    rows={4}
                    maxLength={400}
                    showCount
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: 8 }} className="font-semibold">
                  Ảnh chuyên khoa
                </div>
                <Upload
                  listType="picture-card"
                  className="avatar-uploader-icon"
                  maxCount={1}
                  multiple={false}
                  customRequest={handleUploadFile}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  onPreview={handlePreview}
                  onRemove={() => setFileListIcon([])}
                  fileList={fileListIcon}
                >
                  <div>
                    {loadingIcon ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
                {fileListIcon.length === 0 && (
                  <div style={{ color: "#ff4d4f" }}>
                    Vui lòng chọn ảnh (hoặc giữ nguyên ảnh cũ).
                  </div>
                )}{" "}
              </Col>
            </Row>
          </div>
        </Form>

        {previewImage && (
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </Modal>
    </>
  );
};

export default ClinicUpdate;
