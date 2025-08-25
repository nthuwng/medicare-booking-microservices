import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
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
import { useNavigate, useLocation } from "react-router-dom";

import DoctorCard from "../../components/BookingDoctor/doctor.card";
import type { IDoctorProfile, ISpecialty, IClinic } from "@/types";
import {
  getAllApprovedDoctorsBooking,
  getAllSpecialtiesBooking,
  getAllClinicsBooking,
} from "../../services/client.api";

const { Title, Text } = Typography;
const { Option } = Select;

const DoctorBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [dataDoctors, setDataDoctors] = useState<IDoctorProfile[]>([]);
  const [specialties, setSpecialties] = useState<ISpecialty[]>([]);
  const [clinics, setClinics] = useState<IClinic[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<
    string | undefined
  >(undefined);
  const [selectedClinic, setSelectedClinic] = useState<string | undefined>(
    undefined
  );

  const fetchDoctors = async (
    searchQuery = "",
    overrideSpecialtyId?: string,
    overrideClinicId?: string
  ) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: "1",
        pageSize: "100",
      });

      if (searchQuery.trim()) {
        queryParams.append("fullName", searchQuery.trim());
      }
      const effectiveSpecialtyId =
        overrideSpecialtyId !== undefined
          ? overrideSpecialtyId
          : selectedSpecialty;
      if (effectiveSpecialtyId) {
        queryParams.append("specialtyId", effectiveSpecialtyId);
      }
      const effectiveClinicId =
        overrideClinicId !== undefined ? overrideClinicId : selectedClinic;
      if (effectiveClinicId) {
        queryParams.append("clinicId", effectiveClinicId);
      }

      const response = await getAllApprovedDoctorsBooking(
        queryParams.toString()
      );
      if (response.data) {
        const doctors = response.data.result;
        setDataDoctors(doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Preselect from URL query if available (coming from Specialty page)
    const qs = new URLSearchParams(location.search);
    const spId = qs.get("specialtyId") || undefined;
    const spName = qs.get("specialtyName") || undefined;
    const clId = qs.get("clinicId") || undefined;
    const clName = qs.get("clinicName") || undefined;
    if (spId) setSelectedSpecialty(spId);
    if (spName) setSearchText("");
    if (clId) setSelectedClinic(clId);
    if (clName) setSearchText("");

    const bootstrap = async () => {
      // Load filter sources (specialties, clinics)
      const [spRes, clRes] = await Promise.all([
        getAllSpecialtiesBooking("page=1&pageSize=100"),
        getAllClinicsBooking("page=1&pageSize=100"),
      ]);
      if (spRes.data) setSpecialties(spRes.data.result);
      if (clRes.data) setClinics(clRes.data.result);
      await fetchDoctors("", spId, clId);
    };
    bootstrap();
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setLoading(true);

    try {
      await fetchDoctors(searchText);
    } catch (error) {
      console.error("Error searching doctors:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setSearchText("");
    setIsSearching(false);
    setSelectedSpecialty(undefined);
    setSelectedClinic(undefined);
    await fetchDoctors();
  };

  const handleRefetch = async () => {
    setLoading(true);
    try {
      await fetchDoctors(searchText);
    } catch (error) {
      console.error("Error refetching doctors:", error);
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
              Tìm bác sĩ
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
                Tìm bác sĩ
              </Title>
              <Text className="text-gray-600 text-lg">
                Chọn bác sĩ phù hợp với nhu cầu của bạn
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

          {/* Search & Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Input
                  size="large"
                  placeholder="Tìm kiếm theo tên bác sĩ..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  className="rounded-lg"
                />
              </div>

              {/* Specialty Filter */}
              <Select
                allowClear
                size="large"
                placeholder="Chọn chuyên khoa"
                value={selectedSpecialty}
                onChange={(v) => setSelectedSpecialty(v)}
                className="rounded-lg"
              >
                {specialties.map((s) => (
                  <Option value={String(s.id)} key={s.id}>
                    {s.specialtyName}
                  </Option>
                ))}
              </Select>

              {/* Clinic Filter */}
              <Select
                allowClear
                size="large"
                placeholder="Chọn phòng khám"
                value={selectedClinic}
                onChange={(v) => setSelectedClinic(v)}
                className="rounded-lg"
              >
                {clinics.map((c) => (
                  <Option value={String(c.id)} key={c.id}>
                    {c.clinicName}
                  </Option>
                ))}
              </Select>

              {/* Action Buttons */}
              <div className="flex gap-2 md:justify-end">
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
                  {dataDoctors.length}
                </span>{" "}
                bác sĩ
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
        {!loading && dataDoctors.length === 0 && (
          <Empty
            description="Không tìm thấy bác sĩ phù hợp"
            className="py-12"
          />
        )}

        {/* Doctors List */}
        {!loading && dataDoctors.length > 0 && (
          <DoctorCard
            dataDoctors={dataDoctors}
            setDataDoctors={setDataDoctors}
            searchText={searchText}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorBookingPage;
