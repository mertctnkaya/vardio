import type { CalendarGridProps } from '../../types';
import { getLocalDateString } from '../../utils/dateUtils';
import { TURKISH_HOLIDAYS_2026 } from '../../constants/holidays';

export default function CalendarGrid({
    calendarDays,
    getShiftForDate,
    actualToday,
    employmentStartDate,
    workLogs,
    onDayClick
}: CalendarGridProps) {
    return (
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

                    // Renklendirme Motoru
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
                            onClick={() => onDayClick({
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
        </div>
    );
}