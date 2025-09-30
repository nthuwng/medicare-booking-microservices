import {
  App,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import type { FormProps } from "antd/lib";
import React, { useEffect, useMemo, useState } from "react";
import { createSchedule, getAllTimeSlots } from "../../services/doctor.api";
import type { ITimeSlotDetail } from "@/types/schedule";
import type { IClinic, IDoctorProfile } from "@/types";
import type { Dayjs } from "dayjs";

export interface ITimeSlotDetailDoctor {
  id: number | string;
  name?: string;
  startTime?: string;
  endTime?: string;
}

interface IProps {
  openModalCreate: boolean;
  setOpenModalCreate: (v: boolean) => void;
  timeSlots: ITimeSlotDetailDoctor[];
  dataDoctor: IDoctorProfile | null;
  setDataDoctor: (v: IDoctorProfile | null) => void;
  onCreated: () => void;
}

type FieldType = {
  doctorId: string;
  clinicId: string;
  clinicName: string;
  date: Dayjs;
  timeSlotId: ITimeSlotDetailDoctor[];
};

const DoctorScheduleCreate = (props: IProps) => {
  const {
    openModalCreate,
    setOpenModalCreate,
    timeSlots,
    dataDoctor,
    setDataDoctor,
    onCreated,
  } = props;

  const { message, notification } = App.useApp();

  const [form] = Form.useForm();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    console.log("values", values);
    const d = values.date;

    const payload = {
      date: `${d.year()}/${d.month() + 1}/${d.date()}`,
      timeSlotId: values.timeSlotId.map((t) => Number(t)),
      clinicId: values.clinicId,
      doctorId: values.doctorId,
    };

    const doctorId = payload.doctorId;
    const clinicId = payload.clinicId;
    const timeSlotIds = payload.timeSlotId;
    const date = payload.date;

    try {
      const res = await createSchedule(doctorId, date, +clinicId, timeSlotIds);
      if (res && res.data) {
        message.success("Tạo mới lịch làm việc thành công");
        form.resetFields();
        setOpenModalCreate(false);
        onCreated();
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res.message,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo lịch làm việc",
      });
    }
  };

  const timeSlotOptions = useMemo(
    () =>
      (timeSlots ?? []).map((t) => ({
        value: Number(t.id),
        label: t.name ?? `${t.startTime} - ${t.endTime}`,
      })),
    [timeSlots]
  );

  useEffect(() => {
    if (dataDoctor && openModalCreate) {
      form.setFieldsValue({
        clinicId: dataDoctor.clinicId,
        clinicName: dataDoctor.clinic.clinicName,
        doctorId: dataDoctor.id,
      });
    }
  }, [dataDoctor, openModalCreate]);

  // Reset form khi modal mở
  useEffect(() => {
    if (openModalCreate && dataDoctor) {
      form.resetFields();
      form.setFieldsValue({
        clinicId: dataDoctor.clinicId,
        clinicName: dataDoctor.clinic.clinicName,
        doctorId: dataDoctor.id,
      });
    }
  }, [openModalCreate, dataDoctor, form]);

  return (
    <>
      <Modal
        title="Thêm mới lịch làm việc"
        open={openModalCreate}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          form.resetFields();
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
          name="form-create-schedule"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={15}>
            <Form.Item<FieldType>
              name="doctorId"
              hidden
              rules={[{ required: true, message: "Thiếu doctorId" }]}
            >
              <Input />
            </Form.Item>
            <Col span={24}>
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                label="Tên phòng khám"
                name="clinicName"
              >
                <Input placeholder="Nhập phòng khám" disabled />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                label="Id phòng khám"
                name="clinicId"
                rules={[
                  { required: true, message: "Vui lòng nhập phòng khám!" },
                ]}
                hidden
              >
                <Input placeholder="Nhập phòng khám" disabled />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<FieldType>
                label="Ngày làm việc"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              >
                <DatePicker className="w-full" format="YYYY/MM/DD" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item<FieldType>
                label="Khung giờ làm"
                name="timeSlotId"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 khung giờ!",
                  },
                  {
                    type: "array",
                    min: 1,
                    message: "Chọn ít nhất 1 khung giờ!",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn khung giờ"
                  options={timeSlotOptions}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DoctorScheduleCreate;
