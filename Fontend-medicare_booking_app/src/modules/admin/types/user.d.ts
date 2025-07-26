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
  userInfo: IManageUserDoctor;
}

export interface IClinicDoctor {
  id: number;
  clinicName: string;
  city: string;
  district: string;
  street: string;
  phone: string;
  description: string;
}

export interface ISpecialtyDoctor {
  id: number;
  specialtyName: string;
  iconPath: string;
  description: string;
}

export interface IManageUserDoctor {
  id: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
