import {
  Modal,
  Form,
  Divider,
  Row,
  Col,
  Input,
  Upload,
  App,
  Image,
} from "antd";
import { useEffect, useState } from "react";
import type { FormProps, GetProp, UploadProps, UploadFile } from "antd";
import { updateSpecialty, uploadFileAPI } from "../../services/admin.api";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

interface IProps {
  openModalUpdate: boolean;
  setOpenModalUpdate: (v: boolean) => void;
  refreshTable: () => void;
  dataSpecialty: ISpecialty | null;
}

type FieldType = {
  specialty_name: string;
  description: string;
};

export interface ISpecialty {
  id: string;
  specialtyName: string;
  iconPath: string;
  description: string;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const SpecialitesUpdate = (props: IProps) => {
  const { openModalUpdate, setOpenModalUpdate, refreshTable, dataSpecialty } =
    props;
  const [form] = Form.useForm<FieldType>();
  const { message, notification } = App.useApp();

  const [loadingIcon, setLoadingIcon] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileListIcon, setFileListIcon] = useState<UploadFile[]>([]);
  const [isSubmit, setIsSubmit] = useState(false);

  // ---- Fill dữ liệu cũ khi mở modal ----
  useEffect(() => {
    if (openModalUpdate && dataSpecialty) {
      form.setFieldsValue({
        specialty_name: dataSpecialty.specialtyName,
        description: dataSpecialty.description,
      });

      // nếu có icon cũ thì hiển thị
      if (dataSpecialty.iconPath) {
        setFileListIcon([
          {
            uid: "-1",
            name: "existing",
            status: "done",
            url: dataSpecialty.iconPath,
          } as UploadFile,
        ]);
      } else {
        setFileListIcon([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModalUpdate, dataSpecialty]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (!dataSpecialty?.id) {
      notification.error({ message: "Thiếu ID chuyên khoa để cập nhật" });
      return;
    }
    const { specialty_name, description } = values;
    setIsSubmit(true);

    try {
      // nếu không upload mới, giữ lại iconPath cũ
      let iconPath = dataSpecialty.iconPath || "";
      let iconPublicId = ""; // tuỳ backend có dùng public_id hay không

      if (fileListIcon.length > 0 && fileListIcon[0].url) {
        iconPath = fileListIcon[0].url!;
        // nếu bạn lưu public_id tại name khi upload:
        iconPublicId = fileListIcon[0].name || "";
      } else if (fileListIcon.length === 0) {
        // trường hợp user remove ảnh ⇒ để rỗng (nếu muốn)
        iconPath = "";
        iconPublicId = "";
      }

      const res = await updateSpecialty(
        dataSpecialty.id,
        specialty_name,
        description,
        iconPath,
        iconPublicId
      );

      if (res && res.data) {
        message.success("Cập nhật chuyên khoa thành công");
        form.resetFields();
        setFileListIcon([]);
        setOpenModalUpdate(false);
        refreshTable?.();
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res?.message || "Không rõ nguyên nhân",
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error?.message || "Có lỗi xảy ra khi cập nhật chuyên khoa",
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
    if (!isJpgOrPng) message.error("Chỉ cho phép JPG/PNG");
    const isLt = file.size / 1024 / 1024 < MAX_UPLOAD_IMAGE_SIZE;
    if (!isLt) message.error(`Ảnh phải nhỏ hơn ${MAX_UPLOAD_IMAGE_SIZE}MB`);
    return (isJpgOrPng && isLt) || Upload.LIST_IGNORE;
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
    if (info.file.status === "done" || info.file.status === "error")
      setLoadingIcon(false);
  };

  const handleUploadFile = async (
    options: RcCustomRequestOptions,
    type: "icon"
  ) => {
    const { onSuccess, onError, file } = options;
    try {
      // RcCustomRequestOptions.file là RcFile
      const res = await uploadFileAPI(file as any);
      if (res && res.data) {
        const uploadedFile: UploadFile = {
          uid: (file as any).uid,
          name: res.data.public_id, // để dành public_id
          status: "done",
          url: res.data.url,
        };
        if (type === "icon") setFileListIcon([uploadedFile]);
        onSuccess?.(res.data, file as any);
      } else {
        message.error(res?.message || "Upload thất bại");
        onError?.(new Error(res?.message || "Upload failed"));
      }
    } catch (e: any) {
      onError?.(e);
      message.error(e?.message || "Upload thất bại");
    }
  };

  return (
    <>
      <Modal
        title="Cập nhật chuyên khoa"
        open={openModalUpdate}
        onOk={() => form.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        onCancel={() => {
          form.resetFields();
          setFileListIcon([]);
          setOpenModalUpdate(false);
        }}
        destroyOnClose
        width="50vw"
        maskClosable={false}
        confirmLoading={isSubmit}
      >
        <Divider />

        <Form
          form={form}
          name="form-update-specialty"
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
              {/* Không required cứng; nếu có fileListIcon sẵn coi như hợp lệ */}
              <div style={{ marginBottom: 8 }}>Ảnh chuyên khoa</div>
              <Upload
                listType="picture-card"
                className="avatar-uploader-icon"
                maxCount={1}
                multiple={false}
                customRequest={(options) => handleUploadFile(options, "icon")}
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
              {/* Nếu muốn cảnh báo khi không có ảnh: */}
              {fileListIcon.length === 0 && (
                <div style={{ color: "#ff4d4f" }}>
                  Vui lòng chọn ảnh (hoặc giữ nguyên ảnh cũ).
                </div>
              )}
            </Col>
          </Row>
        </Form>

        {previewImage && (
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (v) => setPreviewOpen(v),
              afterOpenChange: (v) => !v && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </Modal>
    </>
  );
};

export default SpecialitesUpdate;
