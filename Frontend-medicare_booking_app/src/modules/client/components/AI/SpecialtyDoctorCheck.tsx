import type { IAiSpecialtyDoctorCheck } from "@/types";
import {
  UserOutlined,
  PhoneOutlined,
  StarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

// const { Text, Paragraph, Title } = Typography;

interface Props {
  text: string | null;
  data: IAiSpecialtyDoctorCheck | null;
  onFindDoctors?: (specialtyName: string) => void;
}

const SpecialtyDoctorCheck = (props: Props) => {
  const { data } = props;

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">Không tìm thấy bác sĩ</p>
      </div>
    );
  }

  const doctors = data.data;
  const specialtyName = doctors[0]?.specialty?.specialtyName || "Chuyên khoa";

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bác sĩ chuyên khoa {specialtyName}
        </h2>
        <p className="text-gray-600">
          Tìm thấy {doctors.length} bác sĩ tại {doctors[0]?.clinic?.clinicName}
        </p>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {doctor.avatarUrl ? (
                    <img
                      src={doctor.avatarUrl}
                      alt={doctor.fullName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-blue-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserOutlined className="text-3xl text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {doctor.title}. {doctor.fullName}
                    </h3>
                    {doctor.gender === "Male" && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        Nam
                      </span>
                    )}
                    {doctor.gender === "Female" && (
                      <span className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-full">
                        Nữ
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {doctor.bio}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Experience */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <StarOutlined className="text-yellow-500" />
                      <span>{doctor.experienceYears} năm kinh nghiệm</span>
                    </div>

                    {/* Booking Fee */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarOutlined className="text-green-600" />
                      <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(doctor.bookingFee))}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <PhoneOutlined className="text-blue-600" />
                      <span>{doctor.phone}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <EnvironmentOutlined className="text-red-600" />
                      <span>{doctor.clinic.district}</span>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex-shrink-0">
                        {doctor.clinic.iconPath && (
                          <img
                            src={doctor.clinic.iconPath}
                            alt={doctor.clinic.clinicName}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {doctor.clinic.clinicName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doctor.clinic.street}, {doctor.clinic.district}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200">
                  Đặt lịch khám
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clinic Description */}
      {doctors[0]?.clinic?.description && (
        <div className="mt-6 bg-blue-50 rounded-lg p-5 border border-blue-100">
          <h4 className="font-semibold text-gray-800 mb-2">
            Về {doctors[0].clinic.clinicName}
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {doctors[0].clinic.description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <PhoneOutlined className="text-blue-600" />
            <span>Hotline: {doctors[0].clinic.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { SpecialtyDoctorCheck };
