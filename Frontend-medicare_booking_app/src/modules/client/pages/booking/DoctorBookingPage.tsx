import { useState, useEffect } from "react";
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
import { useCurrentApp } from "@/components/contexts/app.context";

const { Title, Text } = Typography;
const { Option } = Select;

const DoctorBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useCurrentApp();
  const isDark = theme === "dark";

  const cls = (...x: (string | false | undefined)[]) =>
    x.filter(Boolean).join(" ");

  // ==== Dark palette (mới) ====
  // Nền: slate-950, block: slate-900, viền: slate-800, chữ phụ: slate-400
  const pageBg = isDark
    ? "bg-[#0b1220]"
    : "bg-gradient-to-b from-blue-50 to-white";
  const headerBg = isDark
    ? "bg-[#0e1625] border-b border-[#1e293b66]"
    : "bg-white border-b";
  const sectionBg = isDark
    ? "bg-[#0e1625] border border-[#1e293b66]"
    : "bg-white border";
  const surface = isDark ? "bg-[#0b1220]" : "bg-white";
  const titleTx = isDark ? "!text-slate-50" : "!text-slate-800"; // tiêu đề sáng hẳn
  const mutedTx = isDark ? "text-slate-300" : "text-slate-600"; // chữ mô tả sáng hơn
  const blueTx = isDark ? "text-blue-300" : "text-blue-600";
  const primaryBtn = isDark
    ? "bg-blue-500 hover:bg-blue-500/90 border-blue-500"
    : "bg-blue-600 hover:bg-blue-700 border-blue-600";

  const fieldDark =
    "!bg-[#0b1220] !text-slate-100 !border-[#1e293b66] focus:!border-[#3b82f6] focus:!ring-2 focus:!ring-[#3b82f6]/30";

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
      const queryParams = new URLSearchParams({ page: "1", pageSize: "100" });
      if (searchQuery.trim())
        queryParams.append("fullName", searchQuery.trim());
      const effSp =
        overrideSpecialtyId !== undefined
          ? overrideSpecialtyId
          : selectedSpecialty;
      if (effSp) queryParams.append("specialtyId", effSp);
      const effCl =
        overrideClinicId !== undefined ? overrideClinicId : selectedClinic;
      if (effCl) queryParams.append("clinicId", effCl);

      const res = await getAllApprovedDoctorsBooking(queryParams.toString());
      if (res.data) setDataDoctors(res.data.result);
    } catch (e) {
      console.error(e);
      message.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const spId = qs.get("specialtyId") || undefined;
    const clId = qs.get("clinicId") || undefined;
    if (spId) setSelectedSpecialty(spId);
    if (clId) setSelectedClinic(clId);

    (async () => {
      const [spRes, clRes] = await Promise.all([
        getAllSpecialtiesBooking("page=1&pageSize=100"),
        getAllClinicsBooking("page=1&pageSize=100"),
      ]);
      if (spRes.data) setSpecialties(spRes.data.result);
      if (clRes.data) setClinics(clRes.data.result);
      await fetchDoctors("", spId, clId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    await fetchDoctors(searchText);
    setIsSearching(false);
  };

  const handleClearFilters = async () => {
    setSearchText("");
    setSelectedSpecialty(undefined);
    setSelectedClinic(undefined);
    await fetchDoctors();
  };

  const handleRefetch = async () => {
    await fetchDoctors(searchText);
  };

  return (
    <div className={cls("min-h-screen doctor-booking", pageBg)}>
      {/* CSS override nhẹ cho Ant trong dark – chỉ áp dụng phạm vi trang */}
      {isDark ? (
        <style>{`
        /* Dropdown (dark) - KHÔNG có .doctor-booking ở đây */
        /* Bỏ viền, nền, shadow cho Button trong Breadcrumb */
.doctor-booking .ant-breadcrumb .ant-btn,
.doctor-booking .ant-breadcrumb .ant-btn:hover,
.doctor-booking .ant-breadcrumb .ant-btn:focus,
.doctor-booking .ant-breadcrumb .ant-btn:active {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 8px !important;     /* giữ spacing nhẹ cho đẹp */
}

/* Màu chữ trong dark */
.doctor-booking .ant-breadcrumb a { color: #cbd5e1 !important; }
.doctor-booking .ant-breadcrumb a:hover { color: #60a5fa !important; }
.doctor-booking .ant-breadcrumb-separator { color: #94a3b8 !important; }

        /* Tăng độ sáng cho chữ + placeholder trong dark mode */
.doctor-booking,
.doctor-booking .ant-typography,
.doctor-booking .ant-breadcrumb,
.doctor-booking .ant-breadcrumb a,
.doctor-booking .ant-select-selection-item,
.doctor-booking .ant-select-arrow {
  color: #e5e7eb !important;        /* slate-200 */
}

/* Input/Select control – chữ & nền & viền */
.doctor-booking input,
.doctor-booking .ant-input,
.doctor-booking .ant-input-affix-wrapper,
.doctor-booking .ant-select-selector {
  color: #e5e7eb !important;
  background: #0b1220 !important;   /* khớp nền */
  border-color: #243244 !important;
}

/* Placeholder sáng hơn */
.doctor-booking input::placeholder,
.doctor-booking .ant-input::placeholder,
.doctor-booking .ant-select-selection-placeholder {
  color: #cbd5e1 !important;         /* slate-300 */
}

/* Nút thường (không primary) cho rõ chữ */
.doctor-booking .ant-btn:not(.ant-btn-primary) {
  color: #e5e7eb !important;
  border-color: #334155 !important;
}

/* Nút disabled cho đỡ “mờ tịt” */
.doctor-booking .ant-btn[disabled] {
  color: #94a3b8 !important;
  border-color: #334155 !important;
  background: #0f172a !important;
}

        .booking-dd{
          background:#111826 !important;
          border:1px solid #243244 !important;
          box-shadow:0 12px 28px rgba(2,6,23,.6) !important;
          border-radius:10px !important;
          overflow:hidden;
          padding:4px 0;
        }
        .booking-dd .ant-select-item{
          color:#e5e7eb !important;
          padding:10px 12px !important;
          transition:background .12s ease, color .12s ease, transform .12s ease;
        }
        .booking-dd .ant-select-item-option:hover,
        .booking-dd .ant-select-item-option-active{
          background:#1b2a44 !important;
          color:#fff !important;
          transform:translateX(2px);
        }
        .booking-dd .ant-select-item-option-selected{
          background:rgba(59,130,246,.18) !important;
          color:#dbeafe !important;
          box-shadow:inset 0 0 0 1px rgba(96,165,250,.45);
        }
        .booking-dd .ant-select-item-option-state{ color:#93c5fd !important; }
      
        /* Phần CONTROL vẫn có tiền tố để chỉ áp dụng trong trang */
        .doctor-booking .ant-select-selector{
          background:#0b1220 !important;
          border-color:#243244 !important;
        }
        .doctor-booking .ant-select-focused .ant-select-selector,
        .doctor-booking .ant-select-selector:hover{
          border-color:#3b82f6 !important;
          box-shadow:0 0 0 2px rgba(59,130,246,.25) !important;
        }
      `}</style>
      ) : (
        <style>{`
          .booking-dd{
            background:#fff !important;
            border:1px solid #e5e7eb !important;
            box-shadow:0 12px 28px rgba(2,6,23,.08) !important;
            border-radius:10px !important;
            overflow:hidden;
            padding:4px 0;
          }
          .booking-dd .ant-select-item{ color:#0f172a !important; padding:10px 12px !important; }
          .booking-dd .ant-select-item-option:hover,
          .booking-dd .ant-select-item-option-active{
            background:#eef6ff !important;
            color:#0b3ea8 !important;
            transform:translateX(2px);
          }
          .booking-dd .ant-select-item-option-selected{
            background:#e6efff !important;
            color:#1d4ed8 !important;
            box-shadow:inset 0 0 0 1px rgba(37,99,235,.35);
          }
        `}</style>
      )}

      {/* Breadcrumb */}
      <div className={headerBg}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            separator={
              <RightOutlined
                className={cls(isDark ? "!text-white" : "text-gray-400")}
              />
            }
            className="text-sm"
          >
            <Breadcrumb.Item>
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/")}
                className={cls(
                  "!p-0 !h-auto !font-bold",
                  isDark
                    ? "!text-slate-300 hover:!text-blue-400"
                    : "!text-slate-600 hover:!text-blue-600"
                )}
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
                className={cls(
                  "!p-0 !h-auto !font-bold",
                  isDark
                    ? "!text-slate-300 hover:!text-blue-400"
                    : "!text-slate-600 hover:!text-blue-600"
                )}
              >
                Hình thức đặt lịch
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item className={cls(blueTx, "!font-bold")}>
              Tìm bác sĩ
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className={cls("shadow-sm border-b", headerBg)}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={2} className={cls("!mb-2", titleTx)}>
                Tìm bác sĩ
              </Title>
              <Text className={cls("text-lg", mutedTx)}>
                Chọn bác sĩ phù hợp với nhu cầu của bạn
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/booking-options")}
              className={primaryBtn}
            >
              Quay lại
            </Button>
          </div>

          {/* Search & Filters */}
          <div className={cls("rounded-xl p-6 shadow-sm", sectionBg)}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Input
                  size="large"
                  placeholder="Tìm kiếm theo tên bác sĩ..."
                  prefix={<SearchOutlined className="text-slate-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  className={cls(isDark ? fieldDark : "")}
                />
              </div>

              {/* Specialty */}
              <Select
                allowClear
                size="large"
                placeholder="Chọn chuyên khoa"
                value={selectedSpecialty}
                onChange={(v) => setSelectedSpecialty(v)}
                className={cls(isDark ? fieldDark : "")}
                dropdownClassName="booking-dd"
              >
                {specialties.map((s) => (
                  <Option value={String(s.id)} key={s.id}>
                    {s.specialtyName}
                  </Option>
                ))}
              </Select>

              {/* Clinic */}
              <Select
                allowClear
                size="large"
                placeholder="Chọn phòng khám"
                value={selectedClinic}
                onChange={(v) => setSelectedClinic(v)}
                className={cls(isDark ? fieldDark : "")}
                dropdownClassName="booking-dd"
              >
                {clinics.map((c) => (
                  <Option value={String(c.id)} key={c.id}>
                    {c.clinicName}
                  </Option>
                ))}
              </Select>

              {/* Actions */}
              <div className="flex gap-2 md:justify-end">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSearch}
                  loading={isSearching}
                  icon={<SearchOutlined />}
                  className={cls(primaryBtn, "rounded-lg")}
                >
                  Tìm kiếm
                </Button>
                <Button
                  size="large"
                  onClick={handleClearFilters}
                  icon={<ClearOutlined />}
                  className={cls("rounded-lg", isDark ? "!text-gray-500" : "")}
                >
                  Xóa lọc
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterOutlined className={blueTx} />
              <Text className={mutedTx}>
                Tìm thấy{" "}
                <span className={cls("font-semibold", blueTx)}>
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
              className={cls(
                "hover:bg-blue-50",
                isDark
                  ? "!bg-[#122037] hover:!bg-[#0D1224] hover:!text-blue-400"
                  : "text-blue-600 border-blue-600"
              )}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}

        {!loading && dataDoctors.length === 0 && (
          <Empty
            description={
              <span className={cls(isDark ? "!text-slate-200" : "")}>
                Không tìm thấy bác sĩ phù hợp
              </span>
            }
            className="py-12"
          />
        )}

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
