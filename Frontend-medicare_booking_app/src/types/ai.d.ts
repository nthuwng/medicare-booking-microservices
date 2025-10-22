export interface IAiRecommendSpecialty {
  specialty_name: string;
  confidence: number;
  reasoning: string;
}


export interface IAiSpecialtyDoctorCheck {
  success: boolean;
  length: number;
  message: string;
  data: IDoctorProfile[];
}

