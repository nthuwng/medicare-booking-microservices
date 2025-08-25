import {
  Modal,
  Form,
  Divider,
  Row,
  Col,
  Input,
  InputNumber,
  Select,
  Upload,
  App,
  Button,
  Image,
} from "antd";
import { useState } from "react";
import type { FormProps, GetProp, UploadProps, UploadFile } from "antd";
import { createSpecialty, uploadFileAPI } from "../../services/admin.api";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
interface IProps {
  openModalCreate: boolean;
  setOpenModalCreate: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  specialty_name: string;
  icon: string;
  description: string;
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const SpecialitesCreate = (props: IProps) => {
  const { openModalCreate, setOpenModalCreate, refreshTable } = props;
  const [form] = Form.useForm();
  const { message, notification } = App.useApp();

  const [loadingIcon, setLoadingIcon] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [fileListIcon, setFileListIcon] = useState<UploadFile[]>([]);

  const [isSubmit, setIsSubmit] = useState(false);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { specialty_name, description } = values;
    setIsSubmit(true);

    try {
      // Lấy thông tin file đã upload
      let iconPath = "";
      let iconPublicId = "";

      if (fileListIcon.length > 0 && fileListIcon[0].url) {
        // Lấy URL từ Cloudinary response
        iconPath = fileListIcon[0].url;
        // Lấy public_id từ name field
        iconPublicId = fileListIcon[0].name || "";
      }

      const res = await createSpecialty(
        specialty_name,
        description,
        iconPath,
        iconPublicId
      );

      if (res && res.data) {
        message.success("Tạo mới chuyên khoa thành công");
        form.resetFields();
        setFileListIcon([]);
        setOpenModalCreate(false);
        refreshTable?.();
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res.message,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo chuyên khoa",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  const getBase64 = (file: FileType): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < MAX_UPLOAD_IMAGE_SIZE;
    if (!isLt2M) {
      message.error(`Image must smaller than ${MAX_UPLOAD_IMAGE_SIZE}MB!`);
    }
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleRemove = async (type: string) => {
    if (type === "icon") {
      setFileListIcon([]);
    }
  };

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") {
      setLoadingIcon(true);
    }

    if (info.file.status === "done" || info.file.status === "error") {
      setLoadingIcon(false);
    }
  };

  const handleUploadFile = async (
    options: RcCustomRequestOptions,
    type: string
  ) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;

    const res = await uploadFileAPI(file);

    if (res && res.data) {
      const uploadedFile: any = {
        uid: (file as any).uid,
        name: res.data.public_id,
        status: "done",
        url: res.data.url,
      };

      if (type === "icon") {
        setFileListIcon([{ ...uploadedFile }]);
      }

      // ✅ báo cho AntD là đã upload xong
      onSuccess?.(res.data, file as any);
    } else {
      message.error(res.message || "Upload thất bại");
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <>
      <Modal
        title="Thêm mới chuyên khoa"
        open={openModalCreate}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          form.resetFields();
          setFileListIcon([]);
          setOpenModalCreate(false);
        }}
        destroyOnClose={true}
        // okButtonProps={{ loading: isSubmit }}
        okText={"Tạo mới"}
        cancelText={"Hủy"}
        // confirmLoading={isSubmit}
        width={"50vw"}
        maskClosable={false}
      >
        <Divider />

        <Form
          form={form}
          name="form-create-book"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={15}>
            <Col span={24}>
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                label="Tên chuyên khoa"
                name="specialty_name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chuyên khoa!" },
                ]}
              >
                <Input placeholder="Nhập tên chuyên khoa" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <Input.TextArea
                  placeholder="Nhập mô tả"
                  rows={4}
                  maxLength={400}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                label="Ảnh chuyên khoa"
                name="icon"
                rules={[{ required: true, message: "Vui lòng upload ảnh!" }]}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  listType="picture-card"
                  className="avatar-uploader-icon"
                  maxCount={1}
                  multiple={false}
                  customRequest={(options) => handleUploadFile(options, "icon")}
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleChange(info)}
                  onPreview={handlePreview}
                  onRemove={() => handleRemove("icon")}
                  fileList={fileListIcon}
                >
                  <div>
                    {loadingIcon ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
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

export default SpecialitesCreate;
