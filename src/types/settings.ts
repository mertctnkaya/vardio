import type { NotificationPreferences } from "./user";

export interface ShiftSystemSectionProps {
  workType: string;
  setWorkType: (val: string) => void;
  shiftStartTime: string;
  setShiftStartTime: (val: string) => void;
  shiftEndTime: string;
  setShiftEndTime: (val: string) => void;
  shiftDuration: string;
  setShiftDuration: (val: string) => void;
  isSaturdayWorkday: boolean;
  setIsSaturdayWorkday: (val: boolean) => void;
}

export interface PayrollSectionProps {
  monthlyGross: string;
  setMonthlyGross: (val: string) => void;
  displayOvertime: string;
  baseWorkHours: string;
  setBaseWorkHours: (val: string) => void;
  nightBonus: string;
  setNightBonus: (val: string) => void;
}

export interface NotificationSectionProps {
  notificationStatus: string;
  onRequestPermission: () => void;
  prefs: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences) => void;
}

export interface DateReferencesSectionProps {
  workType: string;
  employmentStartDate: string;
  setEmploymentStartDate: (val: string) => void;
  shiftEpochDate: string;
  setShiftEpochDate: (val: string) => void;
}