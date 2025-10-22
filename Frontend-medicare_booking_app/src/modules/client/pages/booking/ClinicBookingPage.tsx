import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Typography,
  Spin,
  Empty,
  message,
  Breadcrumb,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ClearOutlined,
  HomeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { IClinic } from "@/types";
import { getAllClinicsBooking } from "../../services/client.api";
import BookingClinic from "../../components/BookingClinic/BookingClinic";

const { Title, Text } = Typography;

const ClinicBookingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [dataClinics, setDataClinics] = useState<IClinic[]>([]);

  const fetchClinics = async (searchQuery = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: "1",
        pageSize: "100",
      });

      if (searchQuery.trim()) {
        queryParams.append("clinicName", searchQuery.trim());
      }

      const response = await getAllClinicsBooking(queryParams.toString());
      if (response.data) {
        const clinics = response.data.result;
        setDataClinics(clinics);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      message.error("Không thể tải danh sách phòng khám");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setLoading(true);

    try {
      await fetchClinics(searchText);
    } catch (error) {
      console.error("Error searching clinics:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setSearchText("");
    setIsSearching(false);
    await fetchClinics();
  };

  const handleRefetch = async () => {
    setLoading(true);
    try {
      await fetchClinics(searchText);
    } catch (error) {
      console.error("Error refetching clinics:", error);
      message.error("Có lỗi xảy ra khi làm mới dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={<RightOutlined className="text-gray-400" />}
            className="text-sm"
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className="!p-0 !h-auto !text-gray-600 hover:!text-blue-600"
                icon={<HomeOutlined />}
              >
                Trang chủ
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/booking-options")}
                className="!p-0 !h-auto !text-gray-600 hover:!text-blue-600"
              >
                Hình thức đặt lịch
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="text-blue-600 font-medium">
              Phòng khám
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={2} className="!mb-2 !text-gray-800">
                Phòng khám dành cho bạn
              </Title>
              <Text className="text-gray-600 text-lg">
                Chọn phòng khám để xem các bác sĩ phù hợp
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/booking-options")}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              Quay lại
            </Button>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  size="large"
                  placeholder="Tìm kiếm phòng khám..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  className="rounded-lg"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSearch}
                  loading={isSearching}
                  icon={<SearchOutlined />}
                  className="bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg"
                >
                  Tìm kiếm
                </Button>
                <Button
                  size="large"
                  onClick={handleClearFilters}
                  icon={<ClearOutlined />}
                  className="rounded-lg"
                >
                  Xóa lọc
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterOutlined className="text-blue-600" />
              <Text className="text-gray-600">
                Tìm thấy{" "}
                <span className="font-semibold text-blue-600">
                  {dataClinics.length}
                </span>{" "}
                phòng khám
              </Text>
            </div>

            <Button
              size="small"
              onClick={handleRefetch}
              loading={loading}
              icon={<ReloadOutlined />}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}

        {/* Empty State */}
        {!loading && dataClinics.length === 0 && (
          <Empty
            description="Không tìm thấy phòng khám phù hợp"
            className="py-12"
          />
        )}

        {/* Specialties List */}
        {!loading && dataClinics.length > 0 && (
          <BookingClinic
            dataClinics={dataClinics}
            setDataClinics={setDataClinics}
            searchText={searchText}
          />
        )}
      </div>
    </div>
  );
};

export default ClinicBookingPage;
