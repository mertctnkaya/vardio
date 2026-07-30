import { useOutletContext, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type ShiftContextType = ReturnType<
  typeof import("../hooks/useShiftCalculator").useShiftCalculator
>;

export default function CurrentShift() {
  const { targetDate, setTargetDate, currentShift } = useOutletContext<ShiftContextType>();
  const { user, settings } = useAppStore();

  const [reminders, setReminders] = useState<any[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  const formattedDateValue = targetDate.toISOString().split("T")[0];

  const [reminderStartDate, setReminderStartDate] = useState(formattedDateValue);
  const [reminderEndDate, setReminderEndDate] = useState('');
  const [reminderTimeRange, setReminderTimeRange] = useState('');

  // YENİ: Bilgilendirme kutucuğu state'i (Diğer state'lerin altına koyabilirsin)
  const [showWelcome, setShowWelcome] = useState(false);

  // YENİ: Bildirim İzni State'i
  const [showNotificationPromo, setShowNotificationPromo] = useState(false);

  useEffect(() => {
    // Tarayıcı bildirimleri destekliyor mu? İzin daha önce istenmiş mi? Reddedilmiş mi?
    if ('Notification' in window) {
      const isDismissed = localStorage.getItem('hideNotificationPromo');
      if (Notification.permission === 'default' && isDismissed !== 'true') {
        setShowNotificationPromo(true);
      }
    }
  }, []);

  const requestNotificationPermission = () => {
    if (!('Notification' in window)) return;

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // İzin verildi! Şimdilik sadece teşekkür edip kapatıyoruz. (İleride buraya ServiceWorker kodu eklenecek)
        alert('Harika! Artık vardiya dönüşlerinde ve resmi tatillerde bildirim alacaksınız.');
        setShowNotificationPromo(false);
      } else {
        // İzin reddedildi
        setShowNotificationPromo(false);
        localStorage.setItem('hideNotificationPromo', 'true');
      }
    });
  };

  const dismissNotificationPromo = () => {
    setShowNotificationPromo(false);
    localStorage.setItem('hideNotificationPromo', 'true');
  };

  useEffect(() => {
    // Sayfa açıldığında daha önce kapatılmış mı diye kontrol et
    const isHidden = localStorage.getItem('hideWelcomeInfo');
    if (isHidden !== 'true') {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem('hideWelcomeInfo', 'true');
    setShowWelcome(false);
  };

  const fetchReminders = async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('is_completed', { ascending: true })
      .order('date', { ascending: true });

    if (data) setReminders(data);
  }

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setTargetDate(new Date(e.target.value));
      setReminderStartDate(e.target.value);
    }
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + days);
    setTargetDate(newDate);
    setReminderStartDate(newDate.toISOString().split("T")[0]);
  };

  const calculateEndTime = (startTime: string, hoursToAdd: number) => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = (h * 60) + m + (hoursToAdd * 60);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = Math.round(totalMinutes % 60);
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const getShiftHours = () => {
    if (!settings || currentShift.id === -1) return null;

    const start = settings.shift_start_time || '08:00';
    const type = settings.work_type || '3-shift';
    let duration = 8;
    let offset = 0;

    if (type === 'fixed') {
      return `${start} - ${settings.shift_end_time || '18:00'}`;
    } else if (type === '2-shift') {
      duration = Number(settings.shift_duration) || 12;
      if (currentShift.id === 1) offset = duration;
    } else {
      duration = 8;
      if (currentShift.id === 2) offset = 8;
      if (currentShift.id === 1) offset = 16;
    }

    const shiftStart = calculateEndTime(start, offset);
    const shiftEnd = calculateEndTime(shiftStart, duration);
    return `${shiftStart} - ${shiftEnd}`;
  };

  const handleAddReminder = async () => {
    if (!user || !reminderText.trim()) return;
    setIsSavingReminder(true);

    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      date: reminderStartDate,
      end_date: reminderEndDate || null,
      time_range: reminderTimeRange || null,
      content: reminderText,
      is_completed: false
    });

    if (!error) {
      setReminderText('');
      setReminderEndDate('');
      setReminderTimeRange('');
      setShowReminderModal(false);
      fetchReminders();
    }
    setIsSavingReminder(false);
  };

  const toggleReminder = async (id: number, currentStatus: boolean) => {
    await supabase.from('reminders').update({ is_completed: !currentStatus }).eq('id', id);
    fetchReminders();
  };

  const deleteReminder = async (id: number) => {
    await supabase.from('reminders').delete().eq('id', id);
    fetchReminders();
  };

  const getStatusBadge = (rem: any) => {
    if (rem.is_completed) return null;

    const targetDate = new Date(rem.end_date || rem.date);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Süresi Geçti</span>;
    } else if (diffDays >= 0 && diffDays <= 2) {
      return <span className="bg-orange-900/40 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Yaklaşıyor</span>;
    }
    return null;
  };

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in w-full pb-10">

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body items-center text-center w-full">
          <h2 className="card-title text-xl mb-4 text-base-content/80">
            Tarih Sorgula
          </h2>

          <input
            type="date"
            value={formattedDateValue}
            onChange={handleDateChange}
            className="input input-bordered w-full max-w-xs text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex items-center justify-between w-full max-w-xs mt-6 gap-2">
            <button onClick={() => shiftDate(-1)} className="btn btn-sm flex-1 bg-slate-700 hover:bg-slate-600 text-white border-none">
              &larr; Dün
            </button>
            <span className="text-sm font-semibold text-base-content whitespace-nowrap px-2">
              {targetDate.toLocaleDateString("tr-TR", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </span>
            <button onClick={() => shiftDate(1)} className="btn btn-sm flex-1 bg-slate-700 hover:bg-slate-600 text-white border-none">
              Yarın &rarr;
            </button>
          </div>

          <div className="flex items-center justify-between w-full max-w-xs mt-3 gap-3">
            <button onClick={() => shiftDate(-7)} className="btn btn-sm flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border-none">
              &laquo; Önceki Hf.
            </button>
            <button onClick={() => shiftDate(7)} className="btn btn-sm flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border-none">
              Gelecek Hf. &raquo;
            </button>
          </div>
          <div className="flex items-center justify-between w-full max-w-xs mt-2 gap-3">
            <button onClick={() => setTargetDate(new Date())} className="btn btn-sm flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md">
              Bugün
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body items-center justify-center text-center">
          <h2 className="card-title text-base-content/80 mb-2">
            Güncel Vardiya
          </h2>

          <div className="text-4xl font-black text-primary mt-4 mb-1">
            {currentShift.name}
          </div>

          {currentShift.id !== -1 && (
            <div className="text-lg font-bold text-base-content/60 mb-2 bg-base-200 px-3 py-1 rounded-md border border-base-300">
              {getShiftHours()}
            </div>
          )}

          {currentShift.note && (
            <div className="mt-3 font-bold px-4 py-2 rounded-lg bg-error/20 text-error border border-error/50">
              {currentShift.note}
            </div>
          )}
        </div>
      </div>

      {/* BİLGİLENDİRME KUTUSU (Çarpı butonlu ve LocalStorage destekli) */}
      {showWelcome && (
        <div className="md:col-span-2 mt-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in relative">

          <button
            onClick={handleCloseWelcome}
            className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-base-content"
            title="Bir daha gösterme"
          >✕</button>

          <div className="text-4xl bg-indigo-900/30 p-2 rounded-full hidden sm:block">👋</div>
          <div className="flex-1 pr-6">
            <h4 className="font-bold text-indigo-400 text-lg flex items-center gap-2">
              <span className="sm:hidden">👋</span> Hoş Geldiniz! Sisteme Yabancı Mısınız?
            </h4>
            <p className="text-sm text-base-content/70 mt-1">
              Vardiyo'nun nasıl çalıştığını, hesapların nasıl yapıldığını ve siteye nereden başlayacağınızı adım adım öğrenmek ister misiniz?
            </p>
          </div>
          <Link to="/faq" className="btn btn-sm h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white border-none shrink-0 w-full sm:w-auto mt-2 sm:mt-0 shadow-lg shadow-indigo-900/40">
            Kullanım Rehberi &rarr;
          </Link>
        </div>
      )}

      {/* YENİ: BİLDİRİM İZNİ KARTI */}
      {showNotificationPromo && (
        <div className="md:col-span-2 mt-2 bg-gradient-to-r from-emerald-900/40 to-[#16191d] border border-emerald-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden animate-fade-in group">
          <button
            onClick={dismissNotificationPromo}
            className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost text-base-content/50 hover:text-base-content z-10"
            title="Şimdilik geç"
          >✕</button>

          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-16 h-16 shrink-0 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-emerald-400 text-lg">Vardiya Dönüşlerini Kaçırmayın!</h4>
              <p className="text-sm text-base-content/70 mt-1">
                Pazar gecesinden uyku düzeni uyarıları, resmi tatil çift yevmiye fırsatları ve kaydettiğiniz hatırlatıcıları vs. cihazınıza anlık bildirim olarak almak ister misiniz?
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 mr-0 sm:mr-2">
              <button onClick={requestNotificationPermission} className="btn p-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/40">
                Evet, Bildirimleri Aç
              </button>
              <button onClick={dismissNotificationPromo} className="btn btn-sm btn-ghost text-base-content/60 hover:bg-base-200">
                Belki Daha Sonra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* HATIRLATMALAR (REMINDERS) MODÜLÜ          */}
      {/* ========================================= */}
      <div className="md:col-span-2 mt-4 bg-[#1e2329] rounded-xl border border-base-300 shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-base-200 border-b border-base-300 p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Hatırlatmalar
          </h3>
          <button onClick={() => setShowReminderModal(true)} className="btn btn-sm btn-outline hover:bg-indigo-600 hover:text-white border-base-content/20">
            + Yeni Hatırlatma
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((rem) => (
                <div key={rem.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${rem.is_completed ? 'bg-base-300/50 border-base-300/50 opacity-50' : 'bg-base-100 border-base-300 shadow-sm'}`}>
                  <div className="flex items-start gap-4 mb-3 sm:mb-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mt-1"
                      checked={rem.is_completed}
                      onChange={() => toggleReminder(rem.id, rem.is_completed)}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className={`font-medium ${rem.is_completed ? 'line-through text-base-content/60' : 'text-base-content'}`}>{rem.content}</p>
                        {getStatusBadge(rem)}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-indigo-400 font-medium">
                        <span className="flex items-center gap-1">
                          📅 {rem.end_date ? `${formatDateLabel(rem.date)} - ${formatDateLabel(rem.end_date)}` : formatDateLabel(rem.date)}
                        </span>
                        {rem.time_range && (
                          <span className="flex items-center gap-1 text-base-content/60">
                            🕒 {rem.time_range}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(rem.id)} className="btn btn-sm btn-ghost p-3 bg-red-800 text-red-400 hover:bg-red-900/20 w-full sm:w-auto">Sil</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-base-content/50 font-medium">Planlanan hatırlatma yok.</p>
              <p className="text-sm text-base-content/40 mt-1">Önemli notlarınızı ve tarih bazlı görevlerinizi buraya ekleyebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>

      {/* HATIRLATMA EKLEME MODALI */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#16191d] rounded-2xl w-full max-w-md shadow-2xl border border-base-300 overflow-hidden">
            <div className="bg-base-200 p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="font-bold text-lg text-indigo-400">Yeni Hatırlatma</h3>
              <button onClick={() => setShowReminderModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>
            <div className="p-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-bold text-base-content/80">Başlangıç Tarihi</span></label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={reminderStartDate}
                    onChange={(e) => setReminderStartDate(e.target.value)}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-bold text-base-content/80">Bitiş (Opsiyonel)</span></label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={reminderEndDate}
                    onChange={(e) => setReminderEndDate(e.target.value)}
                    min={reminderStartDate}
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Saat Aralığı (Opsiyonel)</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 placeholder-base-content/30"
                  placeholder="Örn: 14:00 - 16:00"
                  value={reminderTimeRange}
                  onChange={(e) => setReminderTimeRange(e.target.value)}
                />
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/80">Notunuz</span></label>
                <textarea
                  className="textarea textarea-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 h-24 pt-3 resize-none"
                  placeholder="Mesai talebi, doktor randevusu vs..."
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                ></textarea>
              </div>

              <button
                onClick={handleAddReminder}
                disabled={isSavingReminder || !reminderText.trim()}
                className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 border-none"
              >
                {isSavingReminder ? <span className="loading loading-spinner"></span> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kayıt Ol/Giriş Yap Kutusu */}
      {!user && (
        <div className="md:col-span-2 mt-2 bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-2">Kendinize Göre Özelleştirin</h3>
          <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
            Şu an örnek bir vardiya döngüsünü görüntülüyorsunuz. Kendi işe başlama tarihinizi, yevmiye ayarlarınızı ve devamsızlık durumlarınızı kaydedip otomatik bordro hesabı yaptırmak için ücretsiz hesap oluşturun.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/login" className="btn btn-outline border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white">Giriş Yap</Link>
            <Link to="/register" className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none">Hemen Kayıt Ol</Link>
          </div>
        </div>
      )}
    </div>
  );
}