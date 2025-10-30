import { App, Modal, Table } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import type { UploadProps } from "antd";
import { useState } from "react";
import Exceljs from "exceljs";
import { Buffer } from "buffer";
import templateFile from "@/assets/template/AccountManage.xlsx?url";
import { bulkCreateUsersAPI } from "../../services/admin.api";

const { Dragger } = Upload;

interface IProps {
  openModalImport: boolean;
  setOpenModalImport: (v: boolean) => void;
  refreshTable: () => void;
}

interface IDataImport {
  email: string;
  password: string;
  userType: string;
  fullName: string;
  clinicId: string;
  specialtyId: string;
  phone: string;
  bio: string;
  experienceYears: string;
  bookingFee: string;
  title: string;
  gender: string;
  avatarUrl: string;
  avatarPublicId: string;
  approvalStatus: string;
}

const ImportUser = (props: IProps) => {
  const { setOpenModalImport, openModalImport, refreshTable } = props;

  const { message, notification } = App.useApp();
  const [dataImport, setDataImport] = useState<IDataImport[]>([]);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const propsUpload: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,

    // https://stackoverflow.com/questions/11832930/html-input-file-accept-attribute-file-type-csv
    accept:
      ".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // https://stackoverflow.com/questions/51514757/action-function-is-required-with-antd-upload-control-but-i-dont-need-it
    customRequest({ onSuccess }) {
      setTimeout(() => {
        if (onSuccess) onSuccess("ok");
      }, 1000);
    },

    async onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        console.log(info);
        message.success(`${info.file.name} file uploaded successfully.`);
        if (info.fileList && info.fileList.length > 0) {
          const file = info.fileList[0].originFileObj!;

          //load file to buffer
          const workbook = new Exceljs.Workbook();
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

          //convert file to json
          // helper: chuẩn hoá giá trị từ ExcelJS cell
          const normalizeCell = (val: any) => {
            if (val == null) return "";
            if (typeof val === "object") {
              // Hyperlink: { text, hyperlink }
              if ("text" in val && typeof val.text === "string")
                return val.text;
              // Công thức hoặc kết quả: { result }
              if ("result" in val) return String(val.result ?? "");
              // Rich text: { richText: [{text}, ...] }
              if ("richText" in val && Array.isArray(val.richText)) {
                return val.richText.map((r: any) => r.text ?? "").join("");
              }
              // Fallback: stringify
              return String(val);
            }
            return String(val);
          };

          let jsonData: IDataImport[] = [];

          workbook.worksheets.forEach((sheet) => {
            const firstRow = sheet.getRow(1);
            if (!firstRow.cellCount) return;

            const keys = firstRow.values as any[]; // index bắt đầu từ 1

            sheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) return;
              const values = row.values as any[];

              const obj: any = {};
              for (let i = 1; i < keys.length; i++) {
                const key = String(keys[i]).trim();
                obj[key] = normalizeCell(values[i]).trim();
              }
              jsonData.push(obj);
            });
          });

          jsonData = jsonData.map((item, index) => ({
            ...item,
            id: index + 1,
          }));
          setDataImport(jsonData);
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const handleImport = async () => {
    setIsSubmit(true);
    try {
      const dataSubmit = dataImport.map((item) => ({
        email: item.email,
        password: item.password,
        userType: item.userType || "PATIENT", // Default to CLIENT if not specified
        fullName: item.fullName,
        clinicId: item.clinicId,
        specialtyId: item.specialtyId,
        phone: item.phone,
        bio: item.bio,
        experienceYears: item.experienceYears,
        bookingFee: item.bookingFee,
        title: item.title,
        gender: item.gender,
        avatarUrl: item.avatarUrl || "",
        avatarPublicId: item.avatarPublicId || "",
        approvalStatus: item.approvalStatus,
      }));

      const res = await bulkCreateUsersAPI(dataSubmit);

      if (res.data) {
        if (res.success === true) {
          // Thành công (có thể một phần)
          if (res.data.countError > 0) {
            // Thành công một phần - có email trùng lặp
            notification.warning({
              message: "Import Users Thành Công Một Phần",
              description: (
                <div>
                  <p>
                    <strong>Thành công:</strong> {res.data.countSuccess} người
                    dùng
                  </p>
                  <p>
                    <strong>Lỗi:</strong> {res.data.countError} email đã tồn tại
                  </p>
                  {res.data.existingEmails &&
                    res.data.existingEmails.length > 0 && (
                      <div>
                        <p>
                          <strong>Email đã tồn tại:</strong>
                        </p>
                        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                          {res.data.existingEmails.map(
                            (email: string, index: number) => (
                              <li
                                key={index}
                                style={{
                                  color: "#ff4d4f",
                                  marginBottom: "4px",
                                }}
                              >
                                {email}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              ),
              duration: 8,
            });
          } else {
            // Thành công hoàn toàn
            notification.success({
              message: "Import Users Thành Công",
              description: `Đã tạo thành công ${res.data.countSuccess} người dùng.`,
              duration: 4,
            });
          }
          setOpenModalImport(false);
          setDataImport([]);
          refreshTable();
        } else {
          // Thất bại - hiển thị chi tiết lỗi
          // THẤT BẠI — luôn đọc từ payload.data.existingEmails
          notification.error({
            message: "Import Users Thất Bại",
            description: (
              <div>
                {res.data.existingEmails.length > 0 && (
                  <div>
                    <p>
                      <strong>
                        Danh sách email đã tồn tại (
                        {res.data.existingEmails.length} email):
                      </strong>
                    </p>
                    <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                      {res.data.existingEmails.map(
                        (email: string, idx: number) => (
                          <li
                            key={idx}
                            style={{ color: "#ff4d4f", marginBottom: 4 }}
                          >
                            {email}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {res.data.detail && (
                  <p>
                    <strong>Chi tiết:</strong> {res.data.detail}
                  </p>
                )}
                <p>
                  <strong>Thành công:</strong> {res.data.countSuccess}{" "}
                  &nbsp;|&nbsp;
                  <strong>Lỗi:</strong> {res.data.countError}
                </p>
              </div>
            ),
            duration: 8,
          });
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      notification.error({
        message: "Lỗi Hệ Thống",
        description: "Có lỗi xảy ra khi import users. Vui lòng thử lại.",
        duration: 4,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <>
      <Modal
        title="Import data user"
        width={"50vw"}
        open={openModalImport}
        onOk={() => handleImport()}
        onCancel={() => {
          setOpenModalImport(false);
          setDataImport([]);
        }}
        okText="Import data"
        okButtonProps={{
          disabled: dataImport.length > 0 ? false : true,
          loading: isSubmit,
        }}
        //do not close when click outside
        maskClosable={false}
        destroyOnClose={true}
      >
        <Dragger {...propsUpload}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single upload. Only accept .csv, .xls, .xlsx .or{" "}
            <a
              href={templateFile}
              download
              onClick={(e) => e.stopPropagation()}
            >
              Download Sample File
            </a>
          </p>
        </Dragger>
        <div style={{ paddingTop: 20 }}>
          <Table
            rowKey={"id"}
            title={() => <span>Dữ liệu upload:</span>}
            dataSource={dataImport}
            columns={[
              { dataIndex: "email", title: "Email" },
              { dataIndex: "password", title: "Mật khẩu" },
              {
                dataIndex: "userType",
                title: "Loại người dùng",
                render: (value) =>
                  value === "PATIENT"
                    ? "Bệnh nhân"
                    : value === "DOCTOR"
                    ? "Bác sĩ"
                    : "Admin",
              },
              { dataIndex: "fullName", title: "Họ và tên" },
              { dataIndex: "phone", title: "Số điện thoại" },
              { dataIndex: "title", title: "Chức vụ" },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default ImportUser;
