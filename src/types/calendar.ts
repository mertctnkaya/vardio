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

export interface CalendarHeaderProps {
  baseDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export interface CalendarGridProps {
  calendarDays: any[];
  getShiftForDate: (date: Date) => any;
  actualToday: Date;
  employmentStartDate: Date;
  workLogs: Record<string, any>;
  onDayClick: (dayData: DayDetail, isBeforeEmployment: boolean) => void;
}

export interface CalendarStatsProps {
  monthlyStats: {
    normal: number;
    overtimeHours: number;
    lateHours: number;
    absent: number;
    leave: number;
    annualLeave: number;
    holidayWork: number;
    weekendPaid: number;
    isDangerAbsent: boolean;
    maxConsecutiveAbsent: number;
  };
  baseDate: Date;
}

export interface DayActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: DayDetail | null;
  existingLog: any;
  actualToday: Date;
  user: any;
  onUpdateLog: (dateKey: string, data: any) => void;
  onDeleteLog: (dateKey: string) => void;
}