export interface UserSettings {
  id?: string;
  user_id?: string;
  employment_start_date: string;
  daily_wage: number;
  hourly_overtime: number;
  base_work_hours: number;
  past_used_leave: number;
  updated_at?: string;
  // --- Buradan aşağısı vardiya motoru için ---
  shift_epoch_date: string;
  work_type: string;
  is_saturday_workday: boolean;
  shift_start_time: string;
  shift_end_time: string;
  shift_duration: number;
  role: 'user' | 'admin';
}

export interface Reminder {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  content?: string;
  reminder_date?: string;
  date: string;
  end_date?: string;
  time_range?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  is_completed: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  premium_until: string | null;
}