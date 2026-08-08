import type { DayDetail } from '../types';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useCalendarLogic } from '../hooks/useCalendarLogic';
import { getLocalDateString } from '../utils/dateUtils';
import { fetchMonthWorkLogs } from '../services/dbService';
import { printDocumentAsPDF, downloadDataAsJSON, downloadCalendarAsCSV, generateFileName } from '../utils/exportUtils';
import ExportPanel from '../components/shared/ExportPanel';

import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarStats from '../components/calendar/CalendarStats';
import DayActionModal from '../components/calendar/DayActionModal';

export default function WorktimeCalendar() {
  const { user } = useAppStore();

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

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  
  const [workLogs, setWorkLogs] = useState<Record<string, any>>({});

  const actualToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

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

  const handleDayClick = (dayData: DayDetail, isBeforeEmployment: boolean) => {
    if (isBeforeEmployment) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedDay(dayData);
    setIsModalOpen(true);
  };

  const handleUpdateLog = (dateKey: string, data: any) => {
    setWorkLogs(prev => ({ ...prev, [dateKey]: data }));
  };

  const handleDeleteLogState = (dateKey: string) => {
    setWorkLogs(prev => {
      const newLogs = { ...prev };
      delete newLogs[dateKey];
      return newLogs;
    });
  };

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
    downloadDataAsJSON(generateFileName('Vardiyo', baseDate, user?.user_metadata?.name, '.json'), currentMonthLogs);
  };

  const handlePrintPDF = () => {
    printDocumentAsPDF(generateFileName('Vardiyo', baseDate, user?.user_metadata?.name, ''));
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      <CalendarHeader 
        baseDate={baseDate} 
        onPrev={handlePrevMonth} 
        onNext={handleNextMonth} 
        onToday={handleGoToToday} 
      />

      <CalendarGrid 
        calendarDays={calendarDays}
        getShiftForDate={getShiftForDate}
        actualToday={actualToday}
        employmentStartDate={employmentStartDate}
        workLogs={workLogs}
        onDayClick={handleDayClick}
      />

      <CalendarStats 
        monthlyStats={monthlyStats} 
        baseDate={baseDate} 
      />

      <ExportPanel
        onExportCSV={handleExportCSV}
        onPrintPDF={handlePrintPDF}
        onExportJSON={handleExportJSON}
      />

      {isModalOpen && selectedDay && (
        <DayActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDay={selectedDay}
          existingLog={workLogs[getLocalDateString(selectedDay.date)]}
          actualToday={actualToday}
          user={user}
          onUpdateLog={handleUpdateLog}
          onDeleteLog={handleDeleteLogState}
        />
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