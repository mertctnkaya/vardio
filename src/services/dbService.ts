import { supabase } from '../lib/supabaseClient';

// --- calculations.tsx ---
export const updateUserSettings = async (userId: string, payload: any) => {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
    
  return { data, error };
};

// --- worktimeCalendar.tsx bu fonksiyon ve aşağısındakiler ---
export const fetchMonthWorkLogs = async (userId: string, firstDay: string, lastDay: string) => {
  const { data, error } = await supabase
    .from('work_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', firstDay)
    .lte('log_date', lastDay);

  if (error) {
    console.error("Veri çekme hatası:", error);
    return null;
  }
  
  const logsMap: Record<string, any> = {};
  if (data) {
    data.forEach(log => {
      logsMap[log.log_date] = log;
    });
  }
  return logsMap;
};

export const deleteUserWorkLog = async (userId: string, dateKey: string) => {
  const { error } = await supabase
    .from('work_logs')
    .delete()
    .eq('user_id', userId)
    .eq('log_date', dateKey);
  
  return { error };
};

export const saveUserWorkLog = async (payload: any) => {
  const { data, error } = await supabase
    .from('work_logs')
    .upsert(payload, { onConflict: 'user_id,log_date' })
    .select()
    .single();
    
  return { data, error };
};