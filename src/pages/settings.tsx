import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom'; // YÖNLENDİRME İÇİN EKLENDİ
import Alert from '../components/shared/Alert';
import Icon from '../components/shared/Icon';

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

  const [monthlyGross, setMonthlyGross] = useState('0'); // DEFAULT 0 YAPILDI
  const [baseWorkHours, setBaseWorkHours] = useState('7.5');
  const [nightBonus, setNightBonus] = useState('10');

  const [saturdayMultiplier, setSaturdayMultiplier] = useState('1.5');
  const [weekendMultiplier, setWeekendMultiplier] = useState('2');
  const [holidayMultiplier, _setHolidayMultiplier] = useState('2');

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
        if (data.base_work_hours) setBaseWorkHours(data.base_work_hours.toString());
        if (data.night_bonus_percent) setNightBonus(data.night_bonus_percent.toString());
        if (data.saturday_multiplier) setSaturdayMultiplier(data.saturday_multiplier.toString());
        if (data.weekend_multiplier) setWeekendMultiplier(data.weekend_multiplier.toString());

        // Kullanıcının veritabanındaki günlük yevmiyesinden aylık brütü buluyoruz
        if (data.daily_wage) setMonthlyGross((data.daily_wage * 30).toFixed(2).replace(/\.00$/, ''));
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [user]);

  // --- OTOMATİK HESAPLAMA MOTORU (Render anında çalışır) ---
  const grossNum = Number(monthlyGross) || 0;
  const hoursNum = Number(baseWorkHours) || 7.5;
  const normalHourly = (grossNum / 30) / hoursNum;
  const overtimeHourly = normalHourly * 1.5; // Yüzde 50 zamlı mesai ücreti
  const displayOvertime = overtimeHourly > 0 ? overtimeHourly.toFixed(2) : '0.00';

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

    // Maaş artık default 0 olduğu için, kullanıcı silip boş bırakırsa diye veya 0 girerse diye kontrol:
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
      hourly_overtime: overtimeHourly, // Otomatik hesaplanan değeri veritabanına kaydediyoruz
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

        <div className="bg-base-200 border-b border-base-300 p-6">
          <h2 className="text-2xl font-bold text-base-content">Sistem ve Bordro Ayarları</h2>
          <p className="text-sm text-base-content/60 mt-1">İşletmenizin kurallarına göre uygulamanın beynini yapılandırın.</p>
        </div>

        <div className="px-6 pt-6 sm:px-8">
          <Alert color="indigo" borderStyle="colored" className="mb-6" title="Önemli İpuçları" icon="info">
            <ul className="list-disc list-inside space-y-1.5 opacity-90">
              <li><strong className="text-indigo-300">Tarihler:</strong> İşe giriş tarihi takvim içindir, net tarih gerekli değildir. Döngü için geçmişteki işe başladıktan sonraki ilk Gündüz pazartesi gününü seçmelisiniz.</li>
              <li><strong className="text-indigo-300">Normal Çalışma Saati:</strong> Çay ve yemek molalarını <em>çıkararak</em> sadece net çalıştığınız süreyi yazmalısınız. (Örn: 7.5)</li>
              <li><strong className="text-indigo-300">Aylık Brüt Maaş:</strong> Sistemin ana motorudur. Lütfen net değil, sözleşmenizdeki <strong className="text-white">Brüt Tutarı</strong> yazın. Brüt bilmiyorsanız Hesaplamalar sekmesinden "Katsayı Bul" aracını kullanın.</li>
            </ul>
          </Alert>
        </div>

        <div className="p-6 sm:p-8 space-y-8 pt-0">

          {/* DİNAMİK YENİ ALERT COMPONENTİMİZ İLE BİLDİRİMLER */}
          {feedback?.type === 'success' && (
            <Alert color="emerald" icon="check" title="İşlem Başarılı">
              {feedback.message}
            </Alert>
          )}
          {feedback?.type === 'error' && (
            <Alert color="red" icon="warning" title="Kayıt Hatası">
              {feedback.message}
            </Alert>
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

              {/* ========================================= */}
              {/* EKLENEN CUMARTESİ ÇALIŞMA BUTONU          */}
              {/* ========================================= */}
              {workType === 'fixed' && (
                <div className="form-control w-full md:col-span-2 animate-fade-in mt-2">
                  <label className="cursor-pointer label bg-base-200 p-4 rounded-xl border border-gray-500 hover:border-indigo-700 transition-colors flex justify-between items-center">
                    <span className="label-text font-bold text-base-content/80 flex items-center gap-2">
                      <Icon name="calendar" className="w-5 h-5 text-indigo-400" />
                      Cumartesi günleri çalışma var mı?
                    </span>
                    <input 
                      type="checkbox" 
                      className="toggle bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600 checked:bg-emerald-500 checked:border-emerald-500 checked:hover:bg-emerald-600 checked:hover:border-emerald-600 [--tglbg:white]" 
                      checked={isSaturdayWorkday} 
                      onChange={(e) => setIsSaturdayWorkday(e.target.checked)} 
                    />
                  </label>
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

              {/* MAAŞ INPUTU VE HESAPLAMA YÖNLENDİRMESİ */}
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Aylık Brüt Maaş (₺)</span></label>
                <label className="input input-bordered flex items-center gap-2 bg-base-200 border-indigo-500/50">
                  <span className="text-indigo-400 font-bold">₺</span>
                  <input type="number" className="grow font-bold text-white" value={monthlyGross} onChange={(e) => setMonthlyGross(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).select()} />
                </label>
                <Link to="/calculations" className="text-sm font-medium text-indigo-400/80 hover:text-indigo-300 mt-2 ml-1 inline-flex items-center gap-1 transition-colors">
                  <Icon name="info" className="w-4 h-4" /> Brüt tutarınızı bilmiyorsanız tıklayın.
                </Link>
              </div>

              {/* OTOMATİK HESAPLANAN SAATLİK MESAİ */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-base-content/80">Saatlik Mesai Ücreti (+%50)</span>
                </label>
                <label className="input input-bordered flex items-center gap-2 bg-base-300/50 border-emerald-500/30">
                  <span className="text-emerald-500/80 font-bold">₺</span>
                  <input type="text" className="grow font-bold text-emerald-400 pointer-events-none" value={displayOvertime} readOnly />
                </label>
                <label className="label p-1"><span className="label-text-alt text-base-content/40">Brüt maaşa göre anlık hesaplanır.</span></label>
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
          <div className="card bg-[#16191d] shadow-xl border border-base-300 animate-fade-in mt-6">
            <div className="card-body p-6">
              <h2 className="card-title text-emerald-500 border-b border-base-300 pb-2 mb-4 flex items-center gap-2">
                <Icon name="bell" className="w-5 h-5" />
                Bildirim Ayarları
              </h2>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-200 p-4 rounded-xl border border-emerald-500/70">
                <div>
                  <h4 className="font-bold text-base-content text-lg">Akıllı Hatırlatıcılar</h4>
                  <p className="text-sm text-base-content/60 mt-1 max-w-md"> Pazar gecesinden uyku düzeni uyarıları, resmi tatil çift yevmiye fırsatları ve kaydettiğiniz hatırlatıcıları cihazınıza anlık bildirim olarak almak ister misiniz?</p>
                </div>

                <div>
                  {notificationStatus === 'default' && (
                    <button onClick={requestNotificationPermission} className="btn btn-sm h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/40 w-full sm:w-auto">
                      Bildirimleri Aç
                    </button>
                  )}

                  {notificationStatus === 'granted' && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/30">
                      <Icon name="check" className="w-4 h-4" />
                      <span className="font-bold">Açık (Aktif)</span>
                    </div>
                  )}

                  {notificationStatus === 'denied' && (
                    <div className="flex flex-col items-end gap-2 text-right">
                      <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
                        <Icon name="close" className="w-4 h-4" />
                        <span className="font-bold">Engellendi</span>
                      </div>
                      <span className="text-[10px] text-red-400/80 max-w-[200px] leading-tight">
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