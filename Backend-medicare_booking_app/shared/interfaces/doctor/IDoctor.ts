import { ApprovalStatus, Gender } from "../common";

export interface CreateDoctorProfileData {
  userId: string;
  fullName: string;
  phone: string;
  avatar_url?: string;
  clinic_ids: number[];
  specialty_ids: number[];
  bio?: string;
  experience_years?: number;
  gender?: Gender;
  license_number?: string;
  approval_status?: ApprovalStatus;
  createdAt?: Date;
}

export interface UpdateDoctorStatusInput {
  status: "Pending" | "Approved" | "Rejected";
}

export interface AddDoctorSpecialtyData {
  doctorId: string;
  specialtyId: number;
}

export interface AddDoctorClinicData {
  doctorId: string;
  clinicId: number;
}

export interface RemoveDoctorSpecialtyData {
  doctorId: string;
  specialtyId: number;
}

export interface RemoveDoctorClinicData {
  doctorId: string;
  clinicId: number;
}

export interface DoctorWithRelations {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  bio?: string;
  experienceYears?: number;
  gender: Gender;
  avatarUrl?: string;
  approvalStatus: ApprovalStatus;
  licenseNumber: string;
  createdAt: Date;
  specialties: Array<{
    specialty: {
      id: number;
      specialtyName: string;
      iconPath?: string;
      description?: string;
    };
    isActive: boolean;
    createdAt: Date;
  }>;
  clinics: Array<{
    clinic: {
      id: number;
      clinicName: string;
      city?: string;
      district?: string;
      street?: string;
      phone?: string;
      description?: string;
    };
    isActive: boolean;
    createdAt: Date;
  }>;
}
