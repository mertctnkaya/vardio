import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';

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

  const [monthlyGross, setMonthlyGross] = useState('');
  const [hourlyOvertime, setHourlyOvertime] = useState('');
  const [baseWorkHours, setBaseWorkHours] = useState('7.5');
  const [nightBonus, setNightBonus] = useState('10');

  const [saturdayMultiplier, setSaturdayMultiplier] = useState('1.5');
  const [weekendMultiplier, setWeekendMultiplier] = useState('2');
  const [holidayMultiplier, _setHolidayMultiplier] = useState('2');

  // YENİ: Bildirim durumu state'i
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert("Tarayıcınız bildirimleri desteklemiyor.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setNotificationStatus(permission);
    });
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
        if (data.hourly_overtime) setHourlyOvertime(data.hourly_overtime.toString());
        if (data.base_work_hours) setBaseWorkHours(data.base_work_hours.toString());
        if (data.night_bonus_percent) setNightBonus(data.night_bonus_percent.toString());
        if (data.saturday_multiplier) setSaturdayMultiplier(data.saturday_multiplier.toString());
        if (data.weekend_multiplier) setWeekendMultiplier(data.weekend_multiplier.toString());

        if (data.daily_wage) setMonthlyGross((data.daily_wage * 30).toFixed(2).replace(/\.00$/, ''));
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [user]);

  const calculateEndTime = (startTime: string, hoursToAdd: number) => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = (h * 60) + m + (hoursToAdd * 60);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = Math.round(totalMinutes % 60);
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const handleSaveSettings = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setFeedback(null);

    if (monthlyGross === '' || baseWorkHours === '') {
      setFeedback({ type: 'error', message: 'Lütfen maaş ve çalışma süresi alanlarını boş bırakmayın.' });
      window.scrollTo({ top: 0, behavior: 'smooth' }); return;
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
      base_work_hours: Number(baseWorkHours),
      night_bonus_percent: Number(nightBonus) || 0,
      saturday_multiplier: Number(saturdayMultiplier) || 1.5,
      weekend_multiplier: Number(weekendMultiplier) || 2,
      holiday_multiplier: Number(holidayMultiplier) || 2,
      updated_at: new Date().toISOString()
    };

    const { error, data } = await supabase.from('user_settings').upsert(payload).select().single();

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

        <div className="bg-base-200 border-b border-base-300 p-6">
          <h2 className="text-2xl font-bold text-base-content">Sistem ve Bordro Ayarları</h2>
          <p className="text-sm text-base-content/60 mt-1">İşletmenizin kurallarına göre uygulamanın beynini yapılandırın.</p>
        </div>

        <div className="px-6 pt-6 sm:px-8">
          <div className="bg-indigo-900/10 border border-indigo-500/20 text-indigo-200 text-sm p-5 rounded-xl shadow-inner">
            <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              Önemli İpuçları
            </h4>
            <ul className="list-disc list-inside space-y-1.5 opacity-90">
              <li><strong className="text-indigo-300">Tarihler:</strong> İşe giriş tarihi takvim içindir, net tarih gerekli değildir. Döngü için geçmişteki işe başladıktan sonraki ilk Gündüz pazartesi gününü seçmelisiniz.</li>
              <li><strong className="text-indigo-300">Normal Çalışma Saati:</strong> Çay ve yemek molalarını <em>çıkararak</em> sadece net çalıştığınız süreyi yazmalısınız. (Örn: 7.5)</li>
              <li><strong className="text-indigo-300">Aylık Brüt Maaş:</strong> Sistemin ana motorudur. Lütfen net değil, sözleşmenizdeki <strong className="text-white">Brüt Tutarı</strong> yazın. Brüt bilmiyorsanız Hesaplamalar sekmesinden "Katsayı Bul" aracını kullanın.</li>
            </ul>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">

          {feedback?.type === 'success' && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-sm p-4 rounded-lg flex items-center gap-3 shadow-sm">
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}
          {feedback?.type === 'error' && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm p-4 rounded-lg flex items-center gap-3 shadow-sm">
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">1. Vardiya Sistemi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control w-full md:col-span-2">
                <label className="label"><span className="label-text font-bold text-base-content/80">Sistem Tipi</span></label>
                <select className="select select-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={workType} onChange={(e) => setWorkType(e.target.value)}>
                  <option value="fixed">Sabit Gündüz (Örn: 08:00 - 18:00)</option>
                  <option value="2-shift">2'li Vardiya (Örn: 12 Saatlik Döngü)</option>
                  <option value="3-shift">3'lü Vardiya (Örn: 8 Saatlik Döngü)</option>
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Gündüz/Başlangıç Saati</span></label>
                <input type="time" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} />
              </div>

              {workType === 'fixed' && (
                <div className="form-control w-full animate-fade-in">
                  <label className="label"><span className="label-text font-bold text-base-content/80">Bitiş Saati</span></label>
                  <input type="time" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} />
                </div>
              )}

              {workType === '2-shift' && (
                <div className="form-control w-full animate-fade-in">
                  <label className="label"><span className="label-text font-bold text-base-content/80">Vardiya Süresi (Saat)</span></label>
                  <input type="number" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" placeholder="Örn: 12" value={shiftDuration} onChange={(e) => setShiftDuration(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">2. Tarih Referansları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">İşe Başlama Tarihi</span></label>
                <input type="date" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={employmentStartDate} onChange={(e) => setEmploymentStartDate(e.target.value)} />
              </div>

              {workType !== 'fixed' && (
                <div className="form-control w-full animate-fade-in">
                  <label className="label"><span className="label-text font-bold text-base-content/80">Döngü Başlangıcı (Gündüz)</span></label>
                  <input type="date" className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" value={shiftEpochDate} onChange={(e) => setShiftEpochDate(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-indigo-400 mb-4 border-b border-base-300 pb-2">3. Bordro ve Ek Ödemeler</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Aylık Brüt Maaş (₺)</span></label>
                <label className="input input-bordered flex items-center gap-2 bg-base-200 border-indigo-500/50">
                  <span className="text-indigo-400 font-bold">₺</span>
                  <input type="number" className="grow font-bold text-white" value={monthlyGross} onChange={(e) => setMonthlyGross(e.target.value)} />
                </label>
              </div>

              {/* DÜZELTME: Saatlik Mesai artık readOnly ve disabled görünümünde */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content/80">Saatlik Mesai (Brüt)</span>
                </label>
                <label className="input input-bordered flex items-center gap-2 bg-base-300/50 border-base-300 opacity-70 cursor-not-allowed">
                  <span className="text-base-content/50">₺</span>
                  <input type="number" className="grow cursor-not-allowed pointer-events-none text-base-content/70" placeholder="Oto hesaplanır" value={hourlyOvertime} readOnly />
                </label>
                <label className="label p-1"><span className="label-text-alt text-base-content/40">Maaş yazıldıktan sonra otomatik hesaplanır.</span></label>
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Normal Çalışma (Saat/Gün)</span></label>
                <input type="number" step="0.5" className="input input-bordered w-full bg-base-200" value={baseWorkHours} onChange={(e) => setBaseWorkHours(e.target.value)} />
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Gece Zammı Oranı (%)</span></label>
                <label className="input input-bordered flex items-center gap-2 bg-base-200">
                  <span className="text-base-content/50">%</span>
                  <input type="number" className="grow" value={nightBonus} onChange={(e) => setNightBonus(e.target.value)} />
                </label>
              </div>

            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-base-300 pt-6">
            <button onClick={handleSaveSettings} disabled={isSaving || isLoading} className="btn btn-wide bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/50">
              {isSaving ? <span className="loading loading-spinner"></span> : 'Ayarları Kaydet'}
            </button>
          </div>
          {/* ========================================= */}
          {/* BİLDİRİM AYARLARI                         */}
          {/* ========================================= */}
          <div className="card bg-base-100 shadow-xl border border-base-200 animate-fade-in">
            <div className="card-body">
              <h2 className="card-title text-emerald-500 border-b border-base-200 pb-2 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Bildirim Ayarları
              </h2>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-200 p-4 rounded-xl border border-base-300">
                <div>
                  <h4 className="font-bold text-base-content text-lg">Akıllı Hatırlatıcılar</h4>
                  <p className="text-sm text-base-content/60 mt-1 max-w-md"> Pazar gecesinden uyku düzeni uyarıları, resmi tatil çift yevmiye fırsatları ve kaydettiğiniz hatırlatıcıları vs. cihazınıza anlık bildirim olarak almak ister misiniz?</p>
                </div>

                <div>
                  {notificationStatus === 'default' && (
                    <button onClick={requestNotificationPermission} className="btn p-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/40 w-full sm:w-auto">
                      Bildirimleri Aç
                    </button>
                  )}

                  {notificationStatus === 'granted' && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="font-bold">Açık (Aktif)</span>
                    </div>
                  )}

                  {notificationStatus === 'denied' && (
                    <div className="flex flex-col items-end gap-2 text-right">
                      <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        <span className="font-bold">Engellendi</span>
                      </div>
                      <span className="text-[10px] text-error max-w-[200px] leading-tight">
                        * Tarayıcı adres çubuğundaki kilit (🔒) ikonuna tıklayıp engeli kaldırmalısınız.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}