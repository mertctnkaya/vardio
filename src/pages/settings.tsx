import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';
import { registerAndSubscribeToPush } from '../lib/pushNotifications';

import Alert from '../components/shared/Alert';
import SettingsHeader from '../components/settings/SettingsHeader';
import ShiftSystemSection from '../components/settings/ShiftSystemSection';
import DateReferencesSection from '../components/settings/DateReferencesSection';
import PayrollSection from '../components/settings/PayrollSection';
import NotificationSection from '../components/settings/NotificationSection';

export default function Settings() {
  const { user, setSettings } = useAppStore();
  const [_showAuthModal, setShowAuthModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [workType, setWorkType] = useState('3-shift');
  const [isSaturdayWorkday, setIsSaturdayWorkday] = useState(false);
  const [employmentStartDate, setEmploymentStartDate] = useState('2026-06-09');
  const [shiftEpochDate, setShiftEpochDate] = useState('2026-07-06');

  const [shiftStartTime, setShiftStartTime] = useState('08:00');
  const [shiftEndTime, setShiftEndTime] = useState('16:00');
  const [shiftDuration, setShiftDuration] = useState('12');

  const [monthlyGross, setMonthlyGross] = useState('0');
  const [baseWorkHours, setBaseWorkHours] = useState('7.5');
  const [nightBonus, setNightBonus] = useState('10');

  const [saturdayMultiplier, setSaturdayMultiplier] = useState('1.5');
  const [weekendMultiplier, setWeekendMultiplier] = useState('2');
  const [holidayMultiplier, _setHolidayMultiplier] = useState('2');

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const [notifPrefs, setNotifPrefs] = useState({
    shift_changes: true, holidays: true, reminders: true, payroll: true,
    risks: true, annual_leave: true, daily_log: false, weekly_summary: false,
    night_shift_health: false, app_updates: false
  });

  const handleRequestPermission = async () => {
    if (!user) return;
    
    // Cihazdan izin iste ve arka planda SW kaydını yapıp Supabase'e token'ı fırlat
    const newStatus = await registerAndSubscribeToPush(user.id);
    
    if (newStatus) {
      setNotificationStatus(newStatus);
    }
  };

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      setIsLoading(true);
      const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();

      if (data) {
        setWorkType(data.work_type || '3-shift');
        setIsSaturdayWorkday(data.is_saturday_workday || false);
        if (data.employment_start_date) setEmploymentStartDate(data.employment_start_date);
        if (data.shift_epoch_date) setShiftEpochDate(data.shift_epoch_date);
        if (data.shift_start_time) setShiftStartTime(data.shift_start_time);
        if (data.shift_end_time) setShiftEndTime(data.shift_end_time);
        if (data.shift_duration) setShiftDuration(data.shift_duration.toString());
        if (data.base_work_hours) setBaseWorkHours(data.base_work_hours.toString());
        if (data.night_bonus_percent) setNightBonus(data.night_bonus_percent.toString());
        if (data.saturday_multiplier) setSaturdayMultiplier(data.saturday_multiplier.toString());
        if (data.weekend_multiplier) setWeekendMultiplier(data.weekend_multiplier.toString());
        if (data.daily_wage) setMonthlyGross((data.daily_wage * 30).toFixed(2).replace(/\.00$/, ''));
        if (data.notification_preferences) {
          setNotifPrefs(data.notification_preferences);
        }
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [user]);

  const grossNum = Number(monthlyGross) || 0;
  const hoursNum = Number(baseWorkHours) || 7.5;
  const normalHourly = (grossNum / 30) / hoursNum;
  const overtimeHourly = normalHourly * 1.5;
  const displayOvertime = overtimeHourly > 0 ? overtimeHourly.toFixed(2) : '0.00';

  const calculateEndTime = (startTime: string, hoursToAdd: number) => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = (h * 60) + m + (hoursToAdd * 60);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = Math.round(totalMinutes % 60);
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const handleTogglePref = async (key: keyof typeof notifPrefs) => {
    if (!user) return;

    const newPrefs = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(newPrefs);

    await supabase.from('user_settings')
      .update({ notification_preferences: newPrefs })
      .eq('user_id', user.id);
  };

  const handleSaveSettings = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setFeedback(null);

    if (monthlyGross === '' || Number(monthlyGross) <= 0 || baseWorkHours === '') {
      setFeedback({ type: 'error', message: 'Lütfen geçerli bir aylık brüt maaş ve çalışma süresi girin.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    let finalEndTime = shiftEndTime;
    if (workType === '3-shift') finalEndTime = calculateEndTime(shiftStartTime, 8);
    else if (workType === '2-shift') finalEndTime = calculateEndTime(shiftStartTime, Number(shiftDuration) || 12);

    const payload = {
      user_id: user.id,
      work_type: workType,
      is_saturday_workday: isSaturdayWorkday,
      employment_start_date: employmentStartDate,
      shift_epoch_date: shiftEpochDate,
      shift_start_time: shiftStartTime,
      shift_end_time: finalEndTime,
      shift_duration: workType === '2-shift' ? Number(shiftDuration) : (workType === '3-shift' ? 8 : 0),
      daily_wage: Number(monthlyGross) / 30,
      hourly_overtime: overtimeHourly,
      base_work_hours: Number(baseWorkHours),
      night_bonus_percent: Number(nightBonus) || 0,
      saturday_multiplier: Number(saturdayMultiplier) || 1.5,
      weekend_multiplier: Number(weekendMultiplier) || 2,
      holiday_multiplier: Number(holidayMultiplier) || 2,
      updated_at: new Date().toISOString()
    };

    const { error, data } = await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' }).select().single();

    if (error) {
      setFeedback({ type: 'error', message: 'Hata: ' + error.message });
    } else {
      setFeedback({ type: 'success', message: 'Ayarlarınız başarıyla kaydedildi.' });
      setSettings(data);
      setShiftEndTime(finalEndTime);
      setTimeout(() => setFeedback(null), 3000);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">
      <div className="w-full max-w-3xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 overflow-hidden relative">

        {isLoading && (
          <div className="absolute inset-0 bg-base-100/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-indigo-500"></span>
          </div>
        )}

        <SettingsHeader />

        <div className="p-6 sm:p-8 space-y-8 pt-0">
          {feedback?.type === 'success' && <Alert color="emerald" icon="check" title="İşlem Başarılı">{feedback.message}</Alert>}
          {feedback?.type === 'error' && <Alert color="red" icon="warning" title="Kayıt Hatası">{feedback.message}</Alert>}

          <ShiftSystemSection
            workType={workType} setWorkType={setWorkType}
            shiftStartTime={shiftStartTime} setShiftStartTime={setShiftStartTime}
            shiftEndTime={shiftEndTime} setShiftEndTime={setShiftEndTime}
            shiftDuration={shiftDuration} setShiftDuration={setShiftDuration}
            isSaturdayWorkday={isSaturdayWorkday} setIsSaturdayWorkday={setIsSaturdayWorkday}
          />

          <DateReferencesSection
            workType={workType}
            employmentStartDate={employmentStartDate} setEmploymentStartDate={setEmploymentStartDate}
            shiftEpochDate={shiftEpochDate} setShiftEpochDate={setShiftEpochDate}
          />

          <PayrollSection
            monthlyGross={monthlyGross} setMonthlyGross={setMonthlyGross}
            displayOvertime={displayOvertime}
            baseWorkHours={baseWorkHours} setBaseWorkHours={setBaseWorkHours}
            nightBonus={nightBonus} setNightBonus={setNightBonus}
          />

          <div className="mt-8 flex justify-end border-t border-base-300 pt-6">
            <button onClick={handleSaveSettings} disabled={isSaving || isLoading} className="btn btn-wide bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/50">
              {isSaving ? <span className="loading loading-spinner"></span> : 'Ayarları Kaydet'}
            </button>
          </div>

          <NotificationSection 
            notificationStatus={notificationStatus}
            onRequestPermission={handleRequestPermission} // Burayı değiştirdik
            prefs={notifPrefs}           
            onToggle={handleTogglePref}
          />
        </div>
      </div>
    </div>
  );
}