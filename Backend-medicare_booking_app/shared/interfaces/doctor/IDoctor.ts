import { ApprovalStatus, Gender } from "../common";

export interface CreateDoctorProfileData {
  userId: string;
  fullName: string;
  phone: string;
  avatar_url?: string;
  clinic_id: number;
  specialty_id: number;
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