export interface CreateDoctorProfileData {
  fullName: string;
  phone: string;
  avatar_url: string;
  clinicId: number;
  specialtyId: number;
  bio: string;
  experienceYears: number;
  gender: string;
  title: string;
  bookingFee: number;
  consultationFee: number;
}

export interface UpdateDoctorStatusInput {
  status: "Pending" | "Approved" | "Rejected";
}