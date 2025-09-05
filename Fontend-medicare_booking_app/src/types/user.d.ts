export interface IManageUser {
  id: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  created_at: string;
  userInfo: IManageUser;
}

export interface IPatientProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  created_at: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  district: string;
  userInfo: IManageUser;
}

export interface IDoctorProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  bio: string;
  experienceYears: number;
  gender: string;
  avatarUrl: string;
  approvalStatus: string;
  title: string;
  specialtyId: number;
  clinicId: number;
  consultationFee: number;
  bookingFee: number;
  createdAt: string;
  clinic: IClinicDoctor;
  specialty: ISpecialtyDoctor;
  scheduleByDoctorId: IScheduleByDoctorId[];
  userInfo: IManageUser;
}

export interface IClinicDoctor {
  id: number;
  clinicName: string;
  city: string;
  district: string;
  street: string;
  phone: string;
  description: string;
  iconPath: string;
}

export interface ISpecialtyDoctor {
  id: number;
  specialtyName: string;
  iconPath: string;
  description: string;
}

export interface IScheduleByDoctorId {
  id: string;
  doctorId: string;
  clinicId: number;
  date: string;
  isAvailable: string;
  timeSlots: ITimeSlotDoctor[];
}

export interface ITimeSlotDoctor {
  scheduleId: string;
  timeSlotId: number;
  maxBooking: number;
  currentBooking: number;
  status: string;
  timeSlot: ITimeSlotDetailDoctor;
}

export interface ITimeSlotDetailDoctor {
  id: number;
  startTime: string;
  endTime: string;
}

export interface IManageUser {
  id: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateAppointmentInput {
  scheduleId: string;
  timeSlotId: number;
  reason?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientCity: string;
  patientDistrict: string;
  patientAddress: string;
  // Thông tin người đặt lịch (khi đặt cho người thân)
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
}

export interface IBooking {
  id: string;
  scheduleId: string;
  timeSlotId: number;
  reason?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientGender: string;
  patientDateOfBirth: string;
  patientCity: string;
  patientDistrict: string;
  patientAddress: string;
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
