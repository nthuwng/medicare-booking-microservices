export interface ISchedule {
  id: string;
  doctorId: string;
  clinicId: number;
  date: string;
  isAvailable: boolean;
  timeSlots: ITimeSlot[];
}

export interface ITimeSlot {
  scheduleId: string;
  timeSlotId: number;
  maxBooking: number;
  currentBooking: number;
  status: "OPEN" | "EXPIRED";
  timeSlot: ITimeSlotDetail;
}

export interface ITimeSlotDetail {
  id: number;
  startTime: string;
  endTime: string;
}

export interface ICreateSchedule {
  schedule: ISchedule;
  timeSlots: ITimeSlot[];
}
