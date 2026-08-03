import type { DayDetail } from '../types';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useCalendarLogic } from '../hooks/useCalendarLogic';
import { TURKISH_HOLIDAYS_2026 } from '../constants/holidays';
import { getLocalDateString } from '../utils/dateUtils';
import ExportPanel from '../components/shared/ExportPanel';
import { fetchMonthWorkLogs, deleteUserWorkLog, saveUserWorkLog } from '../services/dbService';
import { printDocumentAsPDF, downloadDataAsJSON, downloadCalendarAsCSV, generateFileName } from '../utils/exportUtils';

export default function WorktimeCalendar() {
  // Global veritabanından kullanıcı verilerini çekiyoruz
  const { user } = useAppStore();

  // Merkezi takvim motorumuzdan döngüleri ve tarihleri alıyoruz
  const {
    baseDate,
    currentYear,
    currentMonth,
    employmentStartDate,
    calendarDays,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,
    getShiftForDate
  } = useCalendarLogic();

  // Ekrandaki pencereleri (Modalları) açıp kapatmak için tetikleyiciler
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tıklanan günün verilerini ve o gün girilecek inputları tutan değişkenler
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [logHours, setLogHours] = useState('');
  const [dayStatus, setDayStatus] = useState('');
  const [noteText, setNoteText] = useState('');
  
  // Veritabanından gelen tüm kayıtların (logların) tutulduğu ana depo
  const [workLogs, setWorkLogs] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Gelecek günleri hesaplarken kullanmak üzere bugünün saatini sıfırlıyoruz
  const actualToday = new Date();
  actualToday.setHours(0, 0, 0, 0);

  // Takvim ayı her değiştiğinde veya sayfa açıldığında Supabase'den o ayın loglarını getir
  useEffect(() => {
    async function fetchLogs() {
      if (!user) return;
      const firstDay = getLocalDateString(new Date(currentYear, currentMonth, 1));
      const lastDay = getLocalDateString(new Date(currentYear, currentMonth + 1, 0));

      const data = await fetchMonthWorkLogs(user.id, firstDay, lastDay);
      if (data) setWorkLogs(data);
    }
    fetchLogs();
  }, [baseDate, user, currentMonth, currentYear]);

  // Takvimdeki herhangi bir güne tıklandığında modalı hazırlayıp açan fonksiyon
  const handleDayClick = (dayData: DayDetail, isBeforeEmployment: boolean) => {
    if (isBeforeEmployment) return; // İşe giriş öncesi günlere tıklanmayı engeller

    if (!user) {
      setShowAuthModal(true); // Giriş yapılmamışsa uyarı modalını açar
      return;
    }

    const dateKey = getLocalDateString(dayData.date);
    const existingLog = workLogs[dateKey];

    setSelectedDay(dayData);
    setDayStatus(existingLog?.status || ''); // Varsa eski durumu getirir
    setNoteText(existingLog?.note || '');    // Varsa eski notu getirir
    setLogHours(existingLog?.hours ? existingLog.hours.toString() : '');
    setIsModalOpen(true);
  };

  // Kullanıcı modal içinde Normal/Mesai gibi bir buton seçtiğinde inputları sıfırlar veya doldurur
  const handleStatusChange = (status: string) => {
    setDayStatus(status);
    if (status === 'overtime') setLogHours('3');
    else if (status === 'late') setLogHours('1');
    else if (status === 'partial_leave') setLogHours('1');
    else setLogHours('');
  };

  // Seçili güne ait bir log (kayıt) varsa bunu Supabase üzerinden kalıcı olarak siler
  const handleDeleteLog = async () => {
    if (!user || !selectedDay) return;
    setIsSaving(true);
    const dateKey = getLocalDateString(selectedDay.date);

    const { error } = await deleteUserWorkLog(user.id, dateKey);

    if (!error) {
      const newLogs = { ...workLogs };
      delete newLogs[dateKey]; // Hafızadan sil
      setWorkLogs(newLogs);    // Ekranı güncelle
      setIsModalOpen(false);
    } else {
      alert("Silinirken hata oluştu: " + error.message);
    }
    setIsSaving(false);
  };

  // Yeni girilen günlük durumu (Mesai, Tatil vb.) Supabase'e kalıcı olarak kaydeder
  const handleSaveLog = async () => {
    if (!user || !selectedDay) return;
    if (!dayStatus) {
      alert("Lütfen kaydetmeden önce bir 'Günlük Durum' seçin.");
      return;
    }
    setIsSaving(true);

    const dateKey = getLocalDateString(selectedDay.date);
    const payload = {
      user_id: user.id,
      log_date: dateKey,
      status: dayStatus,
      note: noteText,
      hours: Number(logHours) || 0
    };

    const { data, error } = await saveUserWorkLog(payload);

    if (!error && data) {
      setWorkLogs(prev => ({ ...prev, [dateKey]: data })); // Mevcut verilere yeni kaydı ekle
      setIsModalOpen(false);
    } else {
      alert("Kaydedilirken hata oluştu: " + error?.message);
    }
    setIsSaving(false);
  };

  // --- YASAL UYARI VE AYLIK ÖZET HESAPLAMALARI ---
  
  const monthlyStats = useMemo(() => {
    let normal = 0, overtimeHours = 0, lateHours = 0, absent = 0;
    let leave = 0, annualLeave = 0, holidayWork = 0, weekendPaid = 0;
    let maxConsecutiveAbsent = 0, currentConsecutive = 0;

    calendarDays.forEach(item => {
      if (!item.isCurrentMonth || item.date < employmentStartDate) return;
      
      const dateKey = getLocalDateString(item.date);
      const log = workLogs[dateKey];
      const shift = getShiftForDate(item.date);
      const isPast = item.date < actualToday;
      const isToday = item.date.toDateString() === actualToday.toDateString();

      // İstatistik ve Mesai Sınıflandırması
      if (log) {
        if (log.status === 'normal') normal++;
        if (log.status === 'overtime') { normal++; overtimeHours += (Number(log.hours) || 0); }
        if (log.status === 'late' || log.status === 'partial_leave') { normal++; lateHours += (Number(log.hours) || 0); }
        if (log.status === 'absent') absent++;
        if (log.status === 'leave') leave++;
        if (log.status === 'annual_leave') annualLeave++;
        if (log.status === 'holiday_work') holidayWork++;
      } else if (isPast || isToday) {
        if (!shift.isOffDay) normal++;
        else weekendPaid++;
      }

      // Devamsızlık Ardışıklık Kontrolü (İş Kanunu)
      if (log && log.status === 'absent') {
        currentConsecutive++;
        if (currentConsecutive > maxConsecutiveAbsent) maxConsecutiveAbsent = currentConsecutive;
      } else if (!shift.isOffDay) {
        currentConsecutive = 0;
      }
    });

    const isDangerAbsent = absent >= 3 || maxConsecutiveAbsent >= 2;

    return { 
      normal, overtimeHours, lateHours, absent, leave, annualLeave, holidayWork, weekendPaid, 
      isDangerAbsent, maxConsecutiveAbsent 
    };
  }, [calendarDays, workLogs, employmentStartDate, actualToday, getShiftForDate]);

  // --- DIŞA AKTARMA (EXPORT) TETİKLEYİCİLERİ ---

  const handleExportCSV = () => {
    const fileName = generateFileName('Vardiyo', baseDate, user?.user_metadata?.name, '.csv');
    downloadCalendarAsCSV(fileName, calendarDays, workLogs, employmentStartDate, getShiftForDate);
  };

  const handleExportJSON = () => {
    const currentMonthLogs: Record<string, any> = {};
    calendarDays.forEach(item => {
      if (!item.isCurrentMonth || item.date < employmentStartDate) return;
      const dateStr = getLocalDateString(item.date);
      if (workLogs[dateStr]) currentMonthLogs[dateStr] = workLogs[dateStr];
    });
    const fileName = generateFileName('Vardiyo', baseDate, user?.user_metadata?.name, '.json');
    downloadDataAsJSON(fileName, currentMonthLogs);
  };

  const handlePrintPDF = () => {
    const title = generateFileName('Vardiyo', baseDate, user?.user_metadata?.name, '');
    printDocumentAsPDF(title);
  };

  // Modal içerisindeki kuralları belirleyen türetilmiş sabitler
  const isFutureDay = selectedDay && !selectedDay.isPast && selectedDay.date.toDateString() !== actualToday.toDateString();
  const dateKeyForSelected = selectedDay ? getLocalDateString(selectedDay.date) : '';
  const existingLogForSelected = workLogs[dateKeyForSelected];
  const selectedHolidayName = TURKISH_HOLIDAYS_2026[dateKeyForSelected];
  const isSelectedHoliday = !!selectedHolidayName;

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

      {/* ÜST KONTROL PANELİ: Ay Değiştirme Butonları */}
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

      {/* TAKVİM GRID ALANI (Aylar ve Kutular) */}
      <div className="w-full max-w-4xl bg-[#16191d] rounded-xl shadow-2xl border border-base-300 overflow-hidden">
        {/* Haftanın Günleri Başlığı */}
        <div className="grid grid-cols-7 bg-base-200 border-b border-base-300">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-base-content/60">{day}</div>
          ))}
        </div>

        {/* Takvim Kutularının Çizilmesi */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((item, index) => {
            const shift = getShiftForDate(item.date);
            const isPast = item.date < actualToday;
            const isToday = item.date.toDateString() === actualToday.toDateString();
            const isBeforeEmployment = item.date < employmentStartDate;

            const dateKeyStr = getLocalDateString(item.date);
            const holidayName = TURKISH_HOLIDAYS_2026[dateKeyStr];
            const logStatus = workLogs[dateKeyStr]?.status;

            let cellBg = "bg-[#1e2329] hover:bg-[#2a3038] cursor-pointer";
            let textColor = "text-white";

            // Renklendirme Motoru (Geçmişe, Duruma ve Vardiyaya Göre Kutu Rengi Atama)
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

                {/* Eğer resmi tatilse köşeye sarı "Tatil" ibaresi ekle */}
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
                  
                  {/* Gün içine not yazılmışsa ufak bir defter ikonu göster */}
                  {workLogs[dateKeyStr]?.note && !isBeforeEmployment && (
                    <span className="text-white/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                
                {/* Kutulara vardiya ismini bas */}
                {!isBeforeEmployment && (
                  <div className={`mt-auto text-[10px] sm:text-xs font-semibold truncate opacity-80 ${textColor}`}>
                    {shift.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* YASAL DEVAMSIZLIK UYARISI EKRANI (Hesaplama yukarıdaki useMemo'dan gelir) */}
        {monthlyStats.isDangerAbsent && (
          <div className="w-full max-w-4xl mt-6 bg-red-900/10 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm animate-fade-in flex gap-4 items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-bold text-red-500 text-lg">Yasal Uyarı: Devamsızlık Tehlike Sınırı!</h4>
              <p className="text-sm text-base-content/80 mt-1">
                Bu ay içerisinde <strong>{monthlyStats.maxConsecutiveAbsent >= 2 ? 'ardı ardına 2 gün' : 'toplam 3 gün'}</strong> devamsızlık yaptığınız tespit edildi. İş Kanunu Madde 25/II gereğince; mazeretsiz devamsızlıklar işverene <strong className="text-red-400">Tazminatsız Haklı Fesih (İşten Çıkarma)</strong> hakkı tanır. Lütfen durumunuzu yöneticinizle görüşün.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TAKVİM ALTI: AYLIK ÖZET RAPORU (Veriler yukarıdaki useMemo'dan gelir) */}
      <div className="w-full max-w-4xl mt-6 bg-[#16191d] rounded-xl border border-base-300 p-6 shadow-lg animate-fade-in">
        <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(baseDate)} Ayı Özet Raporu
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Normal Mesai</p>
            <p className="text-xl font-bold text-emerald-400">{monthlyStats.normal} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Hafta Tatili</p>
            <p className="text-xl font-bold text-base-content">{monthlyStats.weekendPaid} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Fazla Mesai</p>
            <p className="text-xl font-bold text-green-400">{monthlyStats.overtimeHours} Saat</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Resmi Tatil</p>
            <p className="text-xl font-bold text-yellow-300">{monthlyStats.holidayWork} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Yıllık İzin</p>
            <p className="text-xl font-bold text-pink-400">{monthlyStats.annualLeave} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Ücretli/Rapor</p>
            <p className="text-xl font-bold text-purple-400">{monthlyStats.leave} Gün</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Geç/Eksik</p>
            <p className="text-xl font-bold text-orange-400">{monthlyStats.lateHours} Saat</p>
          </div>
          <div className="bg-[#1e2329] p-4 rounded-lg border border-base-300 text-center">
            <p className="text-xs text-base-content/60 font-bold mb-1">Devamsızlık</p>
            <p className="text-xl font-bold text-red-400">{monthlyStats.absent} Gün</p>
          </div>
        </div>
      </div>

      {/* DIŞA AKTARMA (EXPORT) PANELİ (Shared Component) */}
      <ExportPanel
        onExportCSV={handleExportCSV}
        onPrintPDF={handlePrintPDF}
        onExportJSON={handleExportJSON}
      />

      {/* GÜN DETAYI DÜZENLEME MODALI */}
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

            {/* Gelecek gün kısıtlaması uyarı mesajı */}
            {isFutureDay && (
              <div className="bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm p-3 rounded-xl flex items-center gap-3 mb-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Bu gün henüz yaşanmadı. Sadece geleceğe yönelik planlı izin veya tatil mesaisi girebilirsiniz.</span>
              </div>
            )}

            {/* Resmi Tatil kısıtlaması uyarı mesajı */}
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
            
            {/* Günlük Durum Seçim Radio Butonları */}
            <div className="form-control w-full mb-6">
              <label className="label pb-2"><span className="label-text font-bold text-base-content/80">Günlük Durum</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-100 p-4 rounded-xl border border-base-300 w-full">

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={isFutureDay ?? false} checked={dayStatus === 'normal'} onChange={() => handleStatusChange('normal')} />
                  <span className="label-text font-medium text-base-content/90">Normal Mesai</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={isSelectedHoliday} checked={dayStatus === 'leave'} onChange={() => handleStatusChange('leave')} />
                  <span className="label-text text-purple-400 font-bold">Ücretli İzinli/Raporlu</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#ec4899' }} disabled={isSelectedHoliday} checked={dayStatus === 'annual_leave'} onChange={() => handleStatusChange('annual_leave')} />
                  <span className="label-text text-pink-400 font-bold">Yıllık İzin</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${!isSelectedHoliday ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#fde047' }} disabled={!isSelectedHoliday} checked={dayStatus === 'holiday_work'} onChange={() => handleStatusChange('holiday_work')} />
                  <span className="label-text text-yellow-300 font-bold">Resmi Tatil Mesaisi</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'absent'} onChange={() => handleStatusChange('absent')} />
                  <span className="label-text text-error font-bold">Devamsız / Ücretsiz</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${isFutureDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#10b981' }} disabled={isFutureDay ?? false} checked={dayStatus === 'overtime'} onChange={() => handleStatusChange('overtime')} />
                  <span className="label-text text-emerald-500 font-bold">Fazla Mesai (+Ekstra)</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" style={{ accentColor: '#f97316' }} disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'late'} onChange={() => handleStatusChange('late')} />
                  <span className="label-text text-orange-500 font-bold">Geç Kaldım (Kesinti)</span>
                </label>

                <label className={`label justify-start gap-3 p-1 rounded-lg transition-colors ${(isFutureDay || isSelectedHoliday) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-base-200'}`}>
                  <input type="radio" name="status" className="radio radio-sm" disabled={(isFutureDay ?? false) || isSelectedHoliday} checked={dayStatus === 'partial_leave'} onChange={() => handleStatusChange('partial_leave')} />
                  <span className="label-text text-sky-400 font-bold">Saatlik İzin / Erken Çıkma</span>
                </label>
              </div>
            </div>

            {/* Seçime Göre Çıkan Saat Inputu */}
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

            {/* Günlük Not Defteri Inputu */}
            <div className="form-control w-full mb-2">
              <label className="label pb-2"><span className="label-text font-bold text-base-content/80">Detay / Not (Opsiyonel)</span></label>
              <textarea className="textarea textarea-bordered w-full min-h-[120px] bg-base-100 text-sm focus:ring-2 focus:ring-primary p-4 leading-relaxed resize-y" placeholder="Bu güne dair notlar..." value={noteText} onChange={(e) => setNoteText(e.target.value)}></textarea>
            </div>

            {/* Modal Aksiyon Butonları (İptal / Kaydet / Temizle) */}
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

      {/* GİRİŞ YAP UYARISI MODALI (Oturumsuz Kullanıcılar İçin) */}
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