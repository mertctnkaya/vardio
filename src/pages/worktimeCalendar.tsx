import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabaseClient';

interface DayDetail {
  date: Date;
  shiftName: string;
  isNightShift: boolean;
  isOffDay: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  shiftId: number;
}

const TURKISH_HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "Yılbaşı",
  "2026-03-19": "Ramazan Bayramı Arifesi",
  "2026-03-20": "Ramazan Bayramı 1. Gün",
  "2026-03-21": "Ramazan Bayramı 2. Gün",
  "2026-03-22": "Ramazan Bayramı 3. Gün",
  "2026-04-23": "23 Nisan Ulusal Egemenlik Bayramı",
  "2026-05-01": "1 Mayıs Emek ve Dayanışma Günü",
  "2026-05-19": "19 Mayıs Gençlik ve Spor Bayramı",
  "2026-05-26": "Kurban Bayramı Arifesi",
  "2026-05-27": "Kurban Bayramı 1. Gün",
  "2026-05-28": "Kurban Bayramı 2. Gün",
  "2026-05-29": "Kurban Bayramı 3. Gün",
  "2026-05-30": "Kurban Bayramı 4. Gün",
  "2026-07-15": "15 Temmuz Demokrasi Bayramı",
  "2026-08-30": "30 Ağustos Zafer Bayramı",
  "2026-10-29": "29 Ekim Cumhuriyet Bayramı"
};

// DÜZELTME: Tüm timezone (saat dilimi) kaymalarını engelleyen yardımcı fonksiyon
const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function WorktimeCalendar() {
  const { settings, user } = useAppStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logHours, setLogHours] = useState('');

  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dayStatus, setDayStatus] = useState('');
  const [noteText, setNoteText] = useState('');

  const [baseDate, setBaseDate] = useState(new Date());

  const [workLogs, setWorkLogs] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const actualToday = new Date();
  actualToday.setHours(0, 0, 0, 0);

  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();

  const employmentStartDate = useMemo(() => {
    return settings?.employment_start_date
      ? new Date(settings.employment_start_date + 'T00:00:00')
      : new Date('2026-06-09T00:00:00');
  }, [settings]);

  const epochDate = useMemo(() => {
    return settings?.shift_epoch_date
      ? new Date(settings.shift_epoch_date + 'T00:00:00')
      : new Date('2026-07-06T00:00:00');
  }, [settings]);

  const workType = settings?.work_type || '3-shift';
  const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

  useEffect(() => {
    async function fetchLogs() {
      if (!user) return;
      // DÜZELTME: Ay başı ve sonunu çekerken timezone hatası önlendi
      const firstDay = getLocalDateString(new Date(currentYear, currentMonth, 1));
      const lastDay = getLocalDateString(new Date(currentYear, currentMonth + 1, 0));

      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', firstDay)
        .lte('log_date', lastDay);

      if (data && !error) {
        const logsMap: Record<string, any> = {};
        data.forEach(log => {
          logsMap[log.log_date] = log;
        });
        setWorkLogs(logsMap);
      }
    }
    fetchLogs();
  }, [baseDate, user, currentMonth, currentYear]);

  const handlePrevMonth = () => setBaseDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setBaseDate(new Date(currentYear, currentMonth + 1, 1));
  const handleGoToToday = () => setBaseDate(new Date());

  const getShiftForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    const isOffDay = workType === 'fixed'
      ? (isSunday || (!settings?.is_saturday_workday && isSaturday))
      : isSunday;

    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const diffMs = monday.getTime() - epochDate.getTime();
    const deltaWeeks = Math.floor(diffMs / MS_PER_WEEK);

    let shiftIndex = 0;
    if (workType === '3-shift') shiftIndex = ((deltaWeeks % 3) + 3) % 3;
    else if (workType === '2-shift') shiftIndex = ((deltaWeeks % 2) + 2) % 2;

    return {
      id: shiftIndex,
      name: isOffDay ? 'Tatil' : (workType === 'fixed' ? 'Sabit Gündüz' : (shiftIndex === 0 ? 'Gündüz' : shiftIndex === 1 ? 'Gece' : 'Akşam')),
      isNight: shiftIndex === 1 && workType !== 'fixed',
      isOffDay: isOffDay
    };
  };

  const generateCalendar = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 7 : startDayOfWeek;

    const days = [];
    for (let i = 1; i < startDayOfWeek; i++) {
      const prevDate = new Date(currentYear, currentMonth, 1 - (startDayOfWeek - i));
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(currentYear, currentMonth, i), isCurrentMonth: true });
    }
    const totalCells = days.length > 35 ? 42 : 35;
    const extraDays = totalCells - days.length;
    for (let i = 1; i <= extraDays; i++) {
      days.push({ date: new Date(currentYear, currentMonth + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const calendarDays = generateCalendar();

  const handleDayClick = (dayData: DayDetail, isBeforeEmployment: boolean) => {
    if (isBeforeEmployment) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // DÜZELTME: toISOString yerine lokal saati kullandık
    const dateKey = getLocalDateString(dayData.date);
    const existingLog = workLogs[dateKey];

    setSelectedDay(dayData);

    setDayStatus(existingLog?.status || '');
    setNoteText(existingLog?.note || '');
    setLogHours(existingLog?.hours ? existingLog.hours.toString() : '');
    setIsModalOpen(true);
  };

  const handleStatusChange = (status: string) => {
    setDayStatus(status);
    if (status === 'overtime') setLogHours('3');
    else if (status === 'late') setLogHours('1');
    else if (status === 'partial_leave') setLogHours('1');
    else setLogHours('');
  };

  const handleDeleteLog = async () => {
    if (!user || !selectedDay) return;
    setIsSaving(true);

    // DÜZELTME: toISOString silindi
    const dateKey = getLocalDateString(selectedDay.date);

    const { error } = await supabase
      .from('work_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('log_date', dateKey);

    if (!error) {
      const newLogs = { ...workLogs };
      delete newLogs[dateKey];
      setWorkLogs(newLogs);
      setIsModalOpen(false);
    } else {
      alert("Silinirken hata oluştu: " + error.message);
    }
    setIsSaving(false);
  };

  const handleSaveLog = async () => {
    if (!user || !selectedDay) return;

    if (!dayStatus) {
      alert("Lütfen kaydetmeden önce bir 'Günlük Durum' seçin.");
      return;
    }

    setIsSaving(true);

    // DÜZELTME: toISOString silindi
    const dateKey = getLocalDateString(selectedDay.date);

    const payload = {
      user_id: user.id,
      log_date: dateKey,
      status: dayStatus,
      note: noteText,
      hours: Number(logHours) || 0
    };

    const { data, error } = await supabase
      .from('work_logs')
      .upsert(payload, { onConflict: 'user_id,log_date' })
      .select()
      .single();

    if (!error && data) {
      setWorkLogs(prev => ({ ...prev, [dateKey]: data }));
      setIsModalOpen(false);
    } else {
      alert("Kaydedilirken hata oluştu: " + error?.message);
    }
    setIsSaving(false);
  };

  // --- DIŞA AKTARMA (EXPORT) MOTORLARI ---
  const exportToCSV = () => {
    // Veritabanındaki İngilizce durumları Türkçeye çeviren sözlük
    const statusMap: Record<string, string> = {
      'normal': 'Normal Mesai',
      'overtime': 'Fazla Mesai',
      'leave': 'Ücretli İzin/Rapor',
      'annual_leave': 'Yıllık İzin',
      'holiday_work': 'Resmi Tatil Mesaisi',
      'absent': 'Devamsızlık',
      'late': 'Geç Kalma',
      'partial_leave': 'Saatlik İzin'
    };

    // NOT sütunu gizlilik gereği tamamen kaldırıldı
    let csvContent = "\uFEFFTarih,Vardiya,Durum,Saat (Ek/Eksik)\n";

    calendarDays.forEach(item => {
      if (!item.isCurrentMonth || item.date < employmentStartDate) return;

      const dateStr = getLocalDateString(item.date);
      const log = workLogs[dateStr];
      const shift = getShiftForDate(item.date);

      let statusStr = shift.isOffDay ? 'Hafta Tatili' : 'Normal Mesai';
      if (log && log.status) {
        statusStr = statusMap[log.status] || log.status;
      }

      const hours = log?.hours ? log.hours : '';
      csvContent += `${dateStr},${shift.name},${statusStr},${hours}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Özel Dosya İsimlendirme Motoru
    const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(baseDate);
    const userName = user?.user_metadata?.name ? user.user_metadata.name.replace(/\s+/g, '_') : 'Rapor';
    link.setAttribute("download", `Vardiyo_${monthName}_${userName}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const currentMonthLogs: Record<string, any> = {};
    calendarDays.forEach(item => {
      if (!item.isCurrentMonth || item.date < employmentStartDate) return;
      const dateStr = getLocalDateString(item.date);
      if (workLogs[dateStr]) currentMonthLogs[dateStr] = workLogs[dateStr];
    });

    const blob = new Blob([JSON.stringify(currentMonthLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Özel Dosya İsimlendirme Motoru
    const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(baseDate);
    const userName = user?.user_metadata?.name ? user.user_metadata.name.replace(/\s+/g, '_') : 'Yedek';
    link.setAttribute("download", `Vardiyo_${monthName}_${userName}.json`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printToPDF = () => {
    // Tarayıcı PDF adını <title> etiketinden alır. Geçici olarak değiştiriyoruz.
    const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(baseDate);
    const userName = user?.user_metadata?.name ? user.user_metadata.name.replace(/\s+/g, '_') : 'Rapor';

    const originalTitle = document.title;
    document.title = `Vardiyo_${monthName}_${userName}`;
    window.print();
    document.title = originalTitle; // İşlem bitince orjinal isme geri dön
  };

  const isFutureDay = selectedDay && !selectedDay.isPast && selectedDay.date.toDateString() !== actualToday.toDateString();
  const dateKeyForSelected = selectedDay ? getLocalDateString(selectedDay.date) : '';
  const existingLogForSelected = workLogs[dateKeyForSelected];

  // YENİ: Tıklanan günün resmi tatil olup olmadığını kontrol ediyoruz
  const selectedHolidayName = TURKISH_HOLIDAYS_2026[dateKeyForSelected];
  const isSelectedHoliday = !!selectedHolidayName;

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 px-2 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-base-content min-w-[200px] text-center sm:text-left">
            {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(baseDate)}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="btn btn-sm sm:btn-md btn-outline bg-green-800 p-2 border-text-base-content/70 hover:bg-green-900">&laquo; Önceki Ay</button>
            <button onClick={handleGoToToday} className="btn btn-sm sm:btn-md p-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md">Bugün</button>
            <button onClick={handleNextMonth} className="btn btn-sm sm:btn-md btn-outline bg-green-800 p-2 border-text-base-content/70 hover:bg-green-900">Sonraki Ay &raquo;</button>
          </div>
        </div>
        <div className="badge badge-primary badge-outline font-semibold whitespace-nowrap hidden sm:inline-flex">
          Bordro Dönemi
        </div>
      </div>

      <div className="w-full max-w-4xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 overflow-hidden">
        <div className="grid grid-cols-7 bg-base-200 border-b border-base-300">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-base-content/60">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((item, index) => {
            const shift = getShiftForDate(item.date);
            const isPast = item.date < actualToday;
            const isToday = item.date.toDateString() === actualToday.toDateString();
            const isBeforeEmployment = item.date < employmentStartDate;

            // DÜZELTME: Timezone hatasını engellemek için lokal tarihi yardımcı fonksiyonla alıyoruz
            const dateKeyStr = getLocalDateString(item.date);

            const holidayName = TURKISH_HOLIDAYS_2026[dateKeyStr];
            const logStatus = workLogs[dateKeyStr]?.status;

            let cellBg = "bg-[#1e2329] hover:bg-[#2a3038] cursor-pointer";
            let textColor = "text-white";

            if (isBeforeEmployment) {
              cellBg = "bg-[#1e2329] opacity-30 cursor-not-allowed";
              textColor = "text-white/50";
            } else if (!item.isCurrentMonth) {
              cellBg = "bg-[#16191d] cursor-pointer hover:bg-[#1e2329]";
              textColor = "text-white/50";
            } else if (logStatus) {
              if (logStatus === 'overtime') { cellBg = "bg-green-900/90 cursor-pointer hover:bg-green-900/70"; textColor = "text-green-400"; }
              else if (logStatus === 'leave') { cellBg = "bg-purple-900/40 cursor-pointer hover:bg-purple-900/60"; textColor = "text-purple-400"; }
              else if (logStatus === 'annual_leave') { cellBg = "bg-pink-900/30 cursor-pointer hover:bg-pink-900/50"; textColor = "text-pink-400"; }
              else if (logStatus === 'late') { cellBg = "bg-orange-900/40 cursor-pointer hover:bg-orange-900/60"; textColor = "text-orange-400"; }
              else if (logStatus === 'absent') { cellBg = "bg-red-900/40 cursor-pointer hover:bg-red-900/60"; textColor = "text-red-400"; }
              else if (logStatus === 'partial_leave') { cellBg = "bg-sky-900/40 cursor-pointer hover:bg-sky-900/60"; textColor = "text-sky-400"; }
              else if (logStatus === 'holiday_work') { cellBg = "bg-yellow-900/40 cursor-pointer hover:bg-yellow-900/60"; textColor = "text-yellow-300"; }
              else if (logStatus === 'normal') {
                if (shift.isOffDay) { cellBg = "bg-[#331c17] hover:bg-[#43251e] cursor-pointer"; textColor = "text-[#d97757]"; }
                else if (shift.isNight) { cellBg = "bg-[#163333] hover:bg-[#1f4a4a] cursor-pointer"; textColor = "text-[#5eead4]"; }
                else { cellBg = "bg-[#192a25] hover:bg-[#213831] cursor-pointer"; textColor = "text-[#4ade80]"; }
              }
            } else if (isPast || isToday) {
              if (shift.isOffDay) { cellBg = "bg-[#331c17] hover:bg-[#43251e] cursor-pointer"; textColor = "text-[#d97757]"; }
              else if (shift.isNight) { cellBg = "bg-[#163333] hover:bg-[#1f4a4a] cursor-pointer"; textColor = "text-[#5eead4]"; }
              else { cellBg = "bg-[#192a25] hover:bg-[#213831] cursor-pointer"; textColor = "text-[#4ade80]"; }
            } else {
              if (shift.isOffDay) textColor = "text-[#d97757]";
            }

            return (
              <div
                key={index}
                onClick={() => handleDayClick({
                  date: item.date, shiftName: shift.name, isNightShift: shift.isNight,
                  isOffDay: shift.isOffDay, isPast, isCurrentMonth: item.isCurrentMonth, shiftId: shift.id
                }, isBeforeEmployment)}
                className={`relative min-h-[5rem] sm:min-h-[7rem] p-2 border-r border-b border-base-300 transition-colors duration-200 flex flex-col justify-start ${cellBg} ${index % 7 === 6 ? 'border-r-0' : ''}`}
              >

                {holidayName && (
                  <div className="absolute top-1 right-1 z-20 group">
                    <span className="text-[10px] sm:text-[11px] font-bold text-yellow-300 bg-yellow-900/60 px-1.5 py-0.5 rounded shadow-lg border border-yellow-500/40 cursor-help flex items-center justify-center">
                      🇹🇷 Tatil
                    </span>

                    <div className="absolute bottom-full right-0 mb-1.5 w-48 p-2 bg-yellow-900/95 border border-yellow-500/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                      <p className="text-xs font-bold text-yellow-400">{holidayName}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <span className={`text-sm sm:text-lg font-bold ${textColor} ${isToday ? 'border-b-2 border-primary' : ''}`}>
                    {item.date.getDate()}
                  </span>
                  {workLogs[dateKeyStr]?.note && !isBeforeEmployment && (
                    <span className="text-white/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                {!isBeforeEmployment && (
                  <div className={`mt-auto text-[10px] sm:text-xs font-semibold truncate opacity-80 ${textColor}`}>
                    {shift.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* YENİ: YASAL DEVAMSIZLIK UYARISI MOTORU */}
        {(() => {
          let absentCount = 0;
          let maxConsecutiveAbsent = 0;
          let currentConsecutive = 0;

          calendarDays.forEach(item => {
            if (!item.isCurrentMonth || item.date < employmentStartDate) return;
            const dateKey = getLocalDateString(item.date);
            const log = workLogs[dateKey];
            const isOffDay = getShiftForDate(item.date).isOffDay;

            if (log && log.status === 'absent') {
              absentCount++;
              currentConsecutive++;
              if (currentConsecutive > maxConsecutiveAbsent) maxConsecutiveAbsent = currentConsecutive;
            } else if (!isOffDay) {
              // Tatil olmayan bir mesai gününe gelindiğinde ardışıklık sıfırlanır
              currentConsecutive = 0;
            }
          });

          // KANUN: Ardı ardına 2 gün VEYA toplamda 3 gün
          const showDangerWarning = absentCount >= 3 || maxConsecutiveAbsent >= 2;

          if (showDangerWarning) {
            return (
              <div className="w-full max-w-4xl mt-6 bg-red-900/10 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm animate-fade-in flex gap-4 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-bold text-red-500 text-lg">Yasal Uyarı: Devamsızlık Tehlike Sınırı!</h4>
                  <p className="text-sm text-base-content/80 mt-1">
                    Bu ay içerisinde <strong>{maxConsecutiveAbsent >= 2 ? 'ardı ardına 2 gün' : 'toplam 3 gün'}</strong> devamsızlık yaptığınız tespit edildi. İş Kanunu Madde 25/II gereğince; mazeretsiz devamsızlıklar işverene <strong className="text-red-400">Tazminatsız Haklı Fesih (İşten Çıkarma)</strong> hakkı tanır. Lütfen durumunuzu yöneticinizle görüşün.
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>

      <div className="w-full max-w-4xl mt-6 bg-[#16191d] rounded-xl border border-base-300 p-6 shadow-lg animate-fade-in">
        <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(baseDate)} Ayı Özet Raporu
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(() => {
            let normal = 0, overtimeHours = 0, lateHours = 0, absent = 0, leave = 0, annualLeave = 0, holidayWork = 0, weekendPaid = 0;

            calendarDays.forEach(item => {
              if (!item.isCurrentMonth || item.date < employmentStartDate) return;
              const isPast = item.date < actualToday;
              const isToday = item.date.toDateString() === actualToday.toDateString();
              const dateKey = getLocalDateString(item.date); // DÜZELTME
              const log = workLogs[dateKey];
              const shift = getShiftForDate(item.date);

              if (log) {
                if (log.status === 'normal') normal++;
                if (log.status === 'overtime') { normal++; overtimeHours += (Number(log.hours) || 0); }
                if (log.status === 'late' || log.status === 'partial_leave') { normal++; lateHours += (Number(log.hours) || 0); }
                if (log.status === 'absent') absent++;
                if (log.status === 'leave') leave++;
                if (log.status === 'annual_leave') annualLeave++;
                if (log.status === 'holiday_work') holidayWork++;
              }
              else if (isPast || isToday) {
                if (!shift.isOffDay) normal++;
                else weekendPaid++;
              }
            });

            return (
              <>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Normal Mesai</p>
                  <p className="text-xl font-bold text-emerald-400">{normal} Gün</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Hafta Tatili</p>
                  <p className="text-xl font-bold text-base-content">{weekendPaid} Gün</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Fazla Mesai</p>
                  <p className="text-xl font-bold text-green-400">{overtimeHours} Saat</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Resmi Tatil</p>
                  <p className="text-xl font-bold text-yellow-300">{holidayWork} Gün</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Yıllık İzin</p>
                  <p className="text-xl font-bold text-pink-400">{annualLeave} Gün</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Ücretli/Rapor</p>
                  <p className="text-xl font-bold text-purple-400">{leave} Gün</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Geç/Eksik</p>
                  <p className="text-xl font-bold text-orange-400">{lateHours} Saat</p>
                </div>
                <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
                  <p className="text-xs text-base-content/60 font-bold mb-1">Devamsızlık</p>
                  <p className="text-xl font-bold text-red-400">{absent} Gün</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* DIŞA AKTARMA (EXPORT) BÖLÜMÜ */}
      <div className="w-full max-w-4xl mt-4 bg-[#1e2329] rounded-xl border border-base-300 p-6 shadow-lg animate-fade-in print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="font-bold text-base-content text-lg">Raporu Dışa Aktar</h4>
            <p className="text-sm text-base-content/60 mt-1">Bu ayki çalışma dökümünüzü cihazınıza indirin veya yazdırın.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={exportToCSV} className="btn btn-sm sm:btn-md p-3 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white border-green-500/30 flex-1 sm:flex-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel (CSV)
            </button>
            <button onClick={printToPDF} className="btn btn-sm sm:btn-md p-3 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30 flex-1 sm:flex-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Yazdır / PDF
            </button>
            <button onClick={exportToJSON} className="btn btn-sm sm:btn-md p-3 btn-ghost bg-gray-700 border-base-300 text-base-content/60 hover:bg-base-200 flex-1 sm:flex-none" title="Ham Veri Yedeği">
              JSON
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">

          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-base-200 border border-base-300 rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col animate-fade-in">

            <button onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>

            <h3 className="font-bold text-2xl sm:text-3xl text-primary mb-2 pr-8">
              {selectedDay?.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
            </h3>
            <p className="py-1 text-md sm:text-lg font-medium text-base-content/80">
              Vardiya: <span className="text-base-content">{selectedDay?.shiftName}</span>
            </p>

            <div className="divider my-2 opacity-50"></div>

            {isFutureDay && (
              <div className="bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm p-3 rounded-xl flex items-center gap-3 mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Bu gün henüz yaşanmadı. Sadece geleceğe yönelik planlı izin veya tatil mesaisi girebilirsiniz.</span>
              </div>
            )}

            {/* RESMİ TATİL UYARISI (Modal İçi) */}
            {selectedHolidayName && (
              <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex gap-3 items-start shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-yellow-400">{selectedHolidayName}</p>
                  <p className="text-xs text-yellow-100/70 mt-1">
                    Bu gün resmi tatildir. Yasal olarak bu güne <strong>Yıllık İzin</strong> veya <strong>Devamsızlık</strong> yazılamaz. Bugün çalıştıysanız "Resmi Tatil Mesaisi" seçeneğini işaretleyin.
                  </p>
                </div>
              </div>
            )}
            <br></br>
            <div className="form-control w-full mb-6">
              <label className="label pb-2"><span className="label-text font-bold text-base-content/80">Günlük Durum</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-100 p-4 rounded-xl border border-base-300 w-full">

                {/* NORMAL MESAİ */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={isFutureDay ?? false} checked={dayStatus === 'normal'} onChange={() => handleStatusChange('normal')} />
                  <span className="label-text font-medium text-base-content/90">Normal Mesai</span>
                </label>

                {/* ÜCRETLİ İZİN / RAPOR (Tatillerde kapalı) */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={isSelectedHoliday} checked={dayStatus === 'leave'} onChange={() => handleStatusChange('leave')} />
                  <span className="label-text text-purple-400 font-bold">Ücretli İzinli/Raporlu</span>
                </label>

                {/* YILLIK İZİN (Tatillerde kapalı) */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#ec4899' }} disabled={isSelectedHoliday} checked={dayStatus === 'annual_leave'} onChange={() => handleStatusChange('annual_leave')} />
                  <span className="label-text text-pink-400 font-bold">Yıllık İzin</span>
                </label>

                {/* RESMİ TATİL MESAİSİ (Normal günlerde kapalı) */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${!isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#fde047' }} disabled={!isSelectedHoliday} checked={dayStatus === 'holiday_work'} onChange={() => handleStatusChange('holiday_work')} />
                  <span className="label-text text-yellow-300 font-bold">Resmi Tatil Mesaisi</span>
                </label>

                {/* DEVAMSIZLIK (Gelecekte ve Tatillerde kapalı) */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'absent'} onChange={() => handleStatusChange('absent')} />
                  <span className="label-text text-error font-bold">Devamsız / Ücretsiz</span>
                </label>

                {/* FAZLA MESAİ */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#10b981' }} disabled={isFutureDay ?? false} checked={dayStatus === 'overtime'} onChange={() => handleStatusChange('overtime')} />
                  <span className="label-text text-emerald-500 font-bold">Fazla Mesai (+Ekstra)</span>
                </label>

                {/* GEÇ KALMA (Gelecekte ve Tatillerde kapalı) */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#f97316' }} disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'late'} onChange={() => handleStatusChange('late')} />
                  <span className="label-text text-orange-500 font-bold">Geç Kaldım (Kesinti)</span>
                </label>

                {/* SAATLİK İZİN (Gelecekte ve Tatillerde kapalı) */}
                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'partial_leave'} onChange={() => handleStatusChange('partial_leave')} />
                  <span className="label-text text-sky-400 font-bold">Saatlik İzin / Erken Çıkma</span>
                </label>
              </div>
            </div>

            {['overtime', 'late', 'partial_leave'].includes(dayStatus) && (
              <div className="form-control w-full mb-4 animate-fade-in bg-base-100 p-3 rounded-lg border border-base-300">
                <label className="label pb-1">
                  <span className="label-text font-bold text-base-content/90">
                    {dayStatus === 'overtime' ? 'Kaç Saat Fazla Mesai Yaptınız?' :
                      dayStatus === 'late' ? 'Kaç Saat Geç Kaldınız? (Örn: 1.5)' :
                        'Kaç Saat Erken Çıktınız / İzin Aldınız?'}
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2 bg-base-200 focus-within:ring-2 focus-within:ring-primary">
                  <input type="number" step="0.5" min="0" className="grow" placeholder={dayStatus === 'overtime' ? '3' : '1'} value={logHours} onChange={(e) => { const val = Number(e.target.value); if (val >= 0 || e.target.value === '') setLogHours(e.target.value); }} />
                  <span className="text-base-content/50 font-bold">Saat</span>
                </label>
              </div>
            )}

            <div className="form-control w-full mb-2">
              <label className="label pb-2"><span className="label-text font-bold text-base-content/80">Detay / Not (Opsiyonel)</span></label>
              <textarea className="textarea textarea-bordered w-full min-h-[120px] bg-base-100 text-sm focus:ring-2 focus:ring-primary p-4 leading-relaxed resize-y" placeholder="Bu güne dair notlar..." value={noteText} onChange={(e) => setNoteText(e.target.value)}></textarea>
            </div>

            <div className="modal-action mt-6 flex justify-between items-center w-full">
              <div>
                {existingLogForSelected && (
                  <button className="btn btn-error btn-outline" onClick={handleDeleteLog} disabled={isSaving}>
                    Kaydı Temizle
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button className="btn btn-ghost hover:bg-base-300" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button className="btn px-8 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-900/50" onClick={handleSaveLog} disabled={isSaving}>
                  {isSaving ? <span className="loading loading-spinner"></span> : 'Kaydet'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowAuthModal(false)}></div>
          <div className="bg-base-200 border border-base-300 rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl w-full max-w-sm flex flex-col animate-fade-in text-center">
            <h3 className="font-bold text-xl text-base-content mb-2">Giriş Yapmanız Gerekiyor</h3>
            <p className="text-base-content/70 mb-6 text-sm">Bu güne dair mesai durumu veya not girmek için oturum açmalısınız.</p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none">Giriş Yap / Kayıt Ol</Link>
              <button className="btn btn-ghost hover:bg-base-300 text-base-content/80" onClick={() => setShowAuthModal(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}