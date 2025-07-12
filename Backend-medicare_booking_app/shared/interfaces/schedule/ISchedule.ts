export interface CreateScheduleData {
  doctorId: string;
  date: string | Date | number;
  clinicId: number;
  timeSlotId: number[];
}
