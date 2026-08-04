export type DayStatus = 'normal' | 'overtime' | 'leave' | 'annual_leave' | 'holiday_work' | 'absent' | 'late' | 'partial_leave';

export interface WorkLog {
  status: DayStatus;
  hours?: string | number;
  note?: string;
}

export interface DayDetail {
  date: Date;
  shiftName: string;
  isNightShift: boolean;
  isOffDay: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  shiftId: number;
}

export interface SelectedDayInfo {
  date: Date;
  shiftName: string;
  isNightShift: boolean;
  isOffDay: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  shiftId: number;
}