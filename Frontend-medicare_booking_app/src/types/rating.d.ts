import type { IDoctorProfile, IPatientProfile } from "./user";

export interface IRatingResponse {
  ratings: IRating[];
  ratingStats: IRatingStats;
}

export interface IRating {
  id: string;
  doctorId: string;
  userId: string;
  appointmentId: string | null;
  score: number;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  userProfile: IPatientProfile;
  doctorProfile: IDoctorProfile;
}

export interface IRatingStats {
  doctorId: string;
  avgScore: string;
  totalReviews: number;
  lastReviewAt: string;
  updatedAt: string;
}
