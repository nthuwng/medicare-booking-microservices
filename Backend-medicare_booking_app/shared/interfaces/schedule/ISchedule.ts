export interface CreateScheduleData {
  doctorId: string;
  date: string | Date | number; // Hỗ trợ nhiều format từ frontend
  startTime: string;
  endTime: string;
  isAvailable: boolean | string; // Có thể là "true"/"false" từ form
  clinicId: number | string; // Có thể là string từ form
}
