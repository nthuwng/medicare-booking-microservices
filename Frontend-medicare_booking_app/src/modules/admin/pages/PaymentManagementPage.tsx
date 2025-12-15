import { useEffect, useState } from "react";
import { Card, Table, Avatar, Typography, Spin, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IPaymentRevenue } from "@/types/payment";
import { getAllPayment } from "../services/admin.api";

const { Title, Text } = Typography;

const formatMoney = (value: number) => value.toLocaleString("vi-VN") + " ₫";

const PaymentManagementPage = () => {
  const [data, setData] = useState<IPaymentRevenue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPayment();
      if (res?.success === true) {
        setData(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<IPaymentRevenue> = [
    {
      title: "Phòng khám",
      dataIndex: "clinicInfo",
      key: "clinic",
      render: (clinic) => (
        <Row align="middle" gutter={12}>
          <Col>
            <Avatar size={48} src={clinic.iconPath} />
          </Col>
          <Col>
            <Text strong>{clinic.clinicName}</Text>
            <br />
            <Text type="secondary">
              {clinic.district}, {clinic.city}
            </Text>
          </Col>
        </Row>
      ),
    },
    {
      title: "VNPAY",
      dataIndex: ["revenue", "vnpay"],
      key: "vnpay",
      render: (vnpay) => (
        <>
          <Text strong>{formatMoney(vnpay.totalAmount)}</Text>
          <br />
          <Text type="secondary">{vnpay.count} giao dịch</Text>
        </>
      ),
    },
    {
      title: "Tiền mặt",
      dataIndex: ["revenue", "cash"],
      key: "cash",
      render: (cash) => (
        <>
          <Text strong>{formatMoney(cash.totalAmount)}</Text>
          <br />
          <Text type="secondary">{cash.count} giao dịch</Text>
        </>
      ),
    },
    {
      title: "Tổng doanh thu",
      dataIndex: ["revenue", "total"],
      key: "total",
      render: (total) => (
        <Text strong style={{ color: "#1677ff" }}>
          {formatMoney(total)}
        </Text>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>📊 Quản lý doanh thu phòng khám</Title>

      {loading ? (
        <Spin />
      ) : (
        <Table
          rowKey="hospitalId"
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      )}
    </Card>
  );
};

export default PaymentManagementPage;
