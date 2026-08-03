export type DayStatus = 'normal' | 'overtime' | 'leave' | 'annual_leave' | 'holiday_work' | 'absent' | 'late' | 'partial_leave';

export interface UserSettings {
  id?: string;
  user_id?: string;
  employment_start_date: string;
  daily_wage: number;
  hourly_overtime: number;
  base_work_hours: number;
  past_used_leave: number;
  updated_at?: string;
  // --- BURADAN AŞAĞISI YENİ EKLENDİ (Vardiya motoru için) ---
  shift_epoch_date: string;
  work_type: string;
  is_saturday_workday: boolean;
  shift_start_time: string;
  shift_end_time: string;
  shift_duration: number;
  role: 'user' | 'admin';
}

export interface WorkLog {
  status: DayStatus;
  hours?: string | number;
  note?: string;
}

export interface PayrollIncomes {
  baseMonth: number;
  overtime: number;
  nightBonus: number;
  holidayWork: number;
  extra: number;
  extraSgkExempt: boolean;
  totalGrossHakedis: number;
}

export interface PayrollDeductions {
  absent: number;
  late: number;
}

export interface PayrollTaxes {
  sgk: number;
  unemployment: number;
  incomeTax: number;
  stampTax: number;
}

export interface PayrollNetDeductions {
  bes: number;
  other: number;
}

export interface PayrollResult {
  incomes: PayrollIncomes;
  deductionsGross: PayrollDeductions;
  newGrossMatrah: number;
  taxes: PayrollTaxes;
  netKesintiler: PayrollNetDeductions;
  hesabaYatanNet: number;
}

export interface SeveranceResult {
  yearsWorked: number;
  severanceGross: number;
  severanceStampTax: number;
  severanceNet: number;
  noticeWeeks: number;
  noticeGross: number;
  noticeIncomeTax: number;
  noticeNet: number;
  noticeStampTax: number;
  totalNet: number;
}

export interface HourlyCalcResult {
  monthlyGross: number;
  dailyGross: number;
  hourlyGross: number;
  overtimeGross: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  topic?: string;          // YENİ EKLENDİ
  contact_info?: string;   // YENİ EKLENDİ
  created_at: string;
}

export interface Reminder {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  content?: string;
  reminder_date?: string;
  date: string;            // DÜZELTME: ? işareti kalktı
  end_date?: string;       // YENİ EKLENDİ
  time_range?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  is_completed: boolean;   // DÜZELTME: ? işareti kalktı
  created_at: string;
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

// UI güncellenene kadar HTML'i korumak için geçici bordro tipi
export interface LegacyPayrollData {
  incomes: { baseMonth: number; overtime: number; nightBonus: number; holidayWork: number; extra: number; extraSgkExempt: boolean; totalGrossHakedis: number; };
  deductionsGross: { absent: number; late: number; };
  newGrossMatrah: number;
  taxes: { sgk: number; unemployment: number; incomeTax: number; stampTax: number; };
  netKesintiler: { bes: number; other: number; total: number; }; // DÜZELTME: total zorunlu oldu
  hesabaYatanNet: number;
  stats: {
    totalMesai: number; totalGece: number; totalTatil: number; devamsizlik: number; gecKalma: number;
    payrollDays: number; overtimeHours: number; holidayWorkDays: number; absentDays: number; lateHours: number; annualLeaveDays: number;
  }; // DÜZELTME: HTML'deki tüm değişkenler eklendi ve zorunlu yapıldı
  baseGrossInfo?: any; // DÜZELTME: number yerine any yapıldı (.daily hatası için)
  calculatedNightHours?: number;
  netMaaş: number; // DÜZELTME: ? işareti kalktı
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

export interface FAQ {
  q: string;
  a: React.ReactNode;
  isImportant?: boolean;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  faqs: FAQ[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  premium_until: string | null;
}

export type IconName = 
  | 'crown' | 'users' | 'calendar' | 'bell' | 'trash' 
  | 'close' | 'check' | 'warning' | 'info' | 'mail' | 'premium';

export interface IconProps {
  name: IconName;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  desc: string;
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'rose' | 'indigo' | 'white';
  iconName?: IconName;
}

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
}