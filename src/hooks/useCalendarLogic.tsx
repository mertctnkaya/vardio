import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useCalendarLogic() {
  const { settings } = useAppStore();
  const [baseDate, setBaseDate] = useState(new Date());

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

  return {
    baseDate,
    currentYear,
    currentMonth,
    employmentStartDate,
    calendarDays,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,
    getShiftForDate
  };
}