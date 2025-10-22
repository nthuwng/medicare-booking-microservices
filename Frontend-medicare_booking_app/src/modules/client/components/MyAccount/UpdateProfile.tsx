import {
  LoadingOutlined,
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Select,
  App,
  Upload,
  Image,
  type GetProp,
  type UploadProps,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import type { IPatientProfile } from "@/types";
import {
  deletePatientAvatarAPI,
  updatePatientProfileAPI,
} from "../../services/client.api";
import type { UploadFile } from "antd/lib";
import { uploadFileAPI } from "@/modules/admin/services/admin.api";
import type { UploadChangeParam } from "antd/es/upload";

interface props {
  editProfileModalOpen: boolean;
  setEditProfileModalOpen: (open: boolean) => void;
  dataUpdateProfile: IPatientProfile | null;
  setDataUpdateProfile: (dataUpdateProfile: IPatientProfile | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const UpdateProfile = (props: props) => {
  const {
    editProfileModalOpen,
    setEditProfileModalOpen,
    dataUpdateProfile,
    setDataUpdateProfile,
    setLoading,
  } = props;
  const [form] = Form.useForm();

  // Provinces/Districts of Vietnam
  type TDistrict = { code: number; name: string };
  type TProvince = { code: number; name: string; districts: TDistrict[] };
  const [provinces, setProvinces] = useState<TProvince[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [selectedCityName, setSelectedCityName] = useState<string | undefined>(
    undefined
  );
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    undefined
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<
    string | undefined
  >(undefined);

  const handleSubmit = async (values: any) => {
    const { full_name, phone, gender, date_of_birth, address, city, district } =
      values;
    try {
      let avatar_url = "";

      if (fileList.length > 0 && fileList[0].url) {
        avatar_url = fileList[0].url;
      }
      setLoading(true);
      const response = await updatePatientProfileAPI(
        dataUpdateProfile?.id || "",
        full_name,
        phone,
        gender,
        date_of_birth,
        address,
        city,
        district,
        avatar_url
      );
      if (response.success === true) {
        message.success(response.message);
        // Update parent state so profile refreshes without page reload
        setDataUpdateProfile(response.data as IPatientProfile);
        setEditProfileModalOpen(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditProfileModalOpen(false);
  };

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleRemove = async () => {
    try {
      const response = await deletePatientAvatarAPI(
        dataUpdateProfile?.id || ""
      );
      if (response.success === true) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa ảnh đại diện");
    }
    setFileList([]);
    form.setFieldsValue({ avatar_url: undefined });
    setLoadingUpload(false);
  };

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") setLoadingUpload(true);
    if (info.file.status === "done" || info.file.status === "error") {
      setLoadingUpload(false);
    }
    if (info.file.status === "removed") {
      form.setFieldsValue({ avatar_url: undefined });
    }
  };

  useEffect(() => {
    if (!editProfileModalOpen) return;

    if (dataUpdateProfile) {
      form.setFieldsValue({
        full_name: dataUpdateProfile.full_name,
        phone: dataUpdateProfile.phone,
        gender: dataUpdateProfile.gender || undefined,
        date_of_birth: dataUpdateProfile.date_of_birth
          ? dayjs(dataUpdateProfile.date_of_birth)
          : undefined,
        address: dataUpdateProfile.address,
        city: dataUpdateProfile.city,
        district: dataUpdateProfile.district,
        avatar_url: dataUpdateProfile.avatar_url,
      });
      if (dataUpdateProfile.avatar_url) {
        setFileList([
          {
            uid: "-1",
            name: "avatar",
            status: "done",
            url: dataUpdateProfile.avatar_url,
          } as UploadFile,
        ]);
      } else {
        setFileList([]);
      }
      setSelectedCityName(dataUpdateProfile.city || undefined);
    }
  }, [editProfileModalOpen, dataUpdateProfile, form]);

  useEffect(() => {
    if (!editProfileModalOpen) return;
    const fetchProvinces = async () => {
      try {
        setLoadingLocations(true);
        const res = await fetch("https://provinces.open-api.vn/api/?depth=2");
        const data: TProvince[] = await res.json();
        setProvinces(Array.isArray(data) ? data : []);
      } catch (e) {
        // ignore silently; keep inputs as free text if API fails
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchProvinces();
  }, [editProfileModalOpen]);

  const selectedProvince = useMemo(() => {
    if (!selectedCityName) return undefined;
    return provinces.find((p) => p.name === selectedCityName);
  }, [provinces, selectedCityName]);

  const handleCityChange = (value: string) => {
    setSelectedCityName(value);
    form.setFieldsValue({ city: value, district: undefined });
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
    // Mở modal xem trước, chặn upload tự động
    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreviewUrl(objectUrl);
    setConfirmOpen(true);
    return Upload.LIST_IGNORE;
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    try {
      setLoadingUpload(true);
      const res = await uploadFileAPI(pendingFile);
      if (res && res.data) {
        const uploadedFile: UploadFile = {
          uid: String(Date.now()),
          name: res.data.public_id,
          status: "done",
          url: res.data.url,
        };
        setFileList([uploadedFile]);
        form.setFieldsValue({ avatar_url: res.data.url });
        message.success("Tải ảnh thành công");
      } else {
        message.error(res?.message || "Upload thất bại");
      }
    } catch (e: any) {
      message.error(e?.message || "Upload thất bại");
    } finally {
      setLoadingUpload(false);
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
      setPendingFile(null);
      setPendingPreviewUrl(undefined);
      setConfirmOpen(false);
    }
  };

  const cancelConfirm = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl(undefined);
    setConfirmOpen(false);
  };

  return (
    <Modal
      open={editProfileModalOpen}
      onCancel={handleCancel}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LockOutlined style={{ color: "#1890ff" }} />
          <span>Chỉnh sửa hồ sơ</span>
        </div>
      }
      footer={null}
      width={720}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: "20px" }}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Họ và tên"
              name="full_name"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input placeholder="Nhập họ và tên" size="large" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^(0|\+84)\d{9,10}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" size="large" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Giới tính" name="gender">
              <Select
                size="large"
                placeholder="Chọn giới tính"
                options={[
                  { label: "Nam", value: "Male" },
                  { label: "Nữ", value: "Female" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Ngày sinh" name="date_of_birth">
              <DatePicker
                size="large"
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={24}>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Số nhà, tên đường" size="large" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Thành phố / Tỉnh" name="city">
              <Select
                showSearch
                size="large"
                placeholder="Chọn tỉnh/thành phố"
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
            <Form.Item label="Quận / Huyện" name="district">
              <Select
                showSearch
                size="large"
                placeholder="Chọn quận/huyện"
                optionFilterProp="label"
                disabled={!selectedProvince}
                options={(selectedProvince?.districts || []).map((d) => ({
                  label: d.name,
                  value: d.name,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="avatar_url" label="Ảnh đại diện">
              <Upload
                listType="picture-card"
                maxCount={1}
                multiple={false}
                beforeUpload={beforeUpload}
                onPreview={handlePreview}
                onChange={handleChange}
                onRemove={handleRemove}
                fileList={fileList}
              >
                <div>
                  {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
              {fileList.length === 0 && (
                <div style={{ color: "#ff4d4f" }}>
                  Vui lòng chọn ảnh (hoặc giữ nguyên ảnh cũ).
                </div>
              )}{" "}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, marginTop: "8px" }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button size="large" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" size="large">
              Lưu thay đổi
            </Button>
          </Space>
        </Form.Item>
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
      <Modal
        open={confirmOpen}
        onCancel={cancelConfirm}
        title="Xem trước ảnh đại diện"
        footer={[
          <Button key="cancel" onClick={cancelConfirm}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loadingUpload}
            onClick={confirmUpload}
          >
            Lưu
          </Button>,
        ]}
        centered
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {pendingPreviewUrl && (
            <img
              src={pendingPreviewUrl}
              alt="preview"
              style={{ maxWidth: 320, maxHeight: 320, borderRadius: 8 }}
            />
          )}
        </div>
      </Modal>
    </Modal>
  );
};

export default UpdateProfile;
