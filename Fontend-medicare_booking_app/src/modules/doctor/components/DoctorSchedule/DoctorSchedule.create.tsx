import { Col, Divider, Form, Input, Modal, Row } from "antd";
import type { FormProps } from "antd/lib";
import React, { useEffect, useState } from "react";
import { getAllTimeSlots } from "../../services/doctor.api";
import type { ITimeSlotDetail } from "@/types/schedule";
import type { IClinic } from "@/types";

interface IProps {
  openModalCreate: boolean;
  setOpenModalCreate: (v: boolean) => void;
  timeSlots: ITimeSlotDetail[];
  clinics: IClinic[];
}

type FieldType = {
  date: string;
  timeSlot: string;
};

const DoctorScheduleCreate = (props: IProps) => {
  const { openModalCreate, setOpenModalCreate, timeSlots, clinics } = props;

  console.log(clinics);
  const [form] = Form.useForm();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {};

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
            <Col span={24}>
              <Form.Item<FieldType>
                labelCol={{ span: 24 }}
                label="Tên chuyên khoa"
                name="date"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chuyên khoa!" },
                ]}
              >
                <Input placeholder="Nhập tên chuyên khoa" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DoctorScheduleCreate;
