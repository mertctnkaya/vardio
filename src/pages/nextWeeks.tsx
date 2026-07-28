import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

function formatWeekRange(start: Date, end: Date) {
  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString('tr-TR', { month: 'long' });
  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString('tr-TR', { month: 'long' });

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
}

export default function NextWeeks() {
  const { settings } = useAppStore();

  // Ayarlardan okuyup tam 10 haftalık listeyi anında oluşturan motor
  const upcomingWeeks = useMemo(() => {
    const list = [];
    const today = new Date();
    
    // Bu haftanın Pazartesi gününü bul
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + diffToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    const epochDate = settings?.shift_epoch_date
      ? new Date(settings.shift_epoch_date + 'T00:00:00')
      : new Date('2026-07-06T00:00:00');
    const workType = settings?.work_type || '3-shift';
    const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

    // 10 haftalık döngü (Sen istersen buradaki i < 10 sayısını 15-20 yapabilirsin)
    for (let i = 0; i < 10; i++) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(currentMonday.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const diffMs = weekStart.getTime() - epochDate.getTime();
      const deltaWeeks = Math.floor(diffMs / MS_PER_WEEK);

      let shiftName = 'Gündüz';
      if (workType === 'fixed') {
        shiftName = 'Sabit Gündüz';
      } else if (workType === '2-shift') {
        const shiftIndex = ((deltaWeeks % 2) + 2) % 2;
        shiftName = shiftIndex === 0 ? 'Gündüz' : 'Gece';
      } else {
        const shiftIndex = ((deltaWeeks % 3) + 3) % 3;
        shiftName = shiftIndex === 0 ? 'Gündüz' : shiftIndex === 1 ? 'Gece' : 'Akşam';
      }

      list.push({ weekStart, weekEnd, shiftName });
    }
    return list;
  }, [settings]);

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-10">
      <div className="w-full max-w-4xl mb-6 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-base-content">Gelecek Haftalar</h2>
          <p className="text-base-content/60 mt-1">Önümüzdeki 10 haftanın vardiya planlaması.</p>
        </div>
      </div>

      <div className="card bg-[#16191d] shadow-xl border border-base-300 w-full max-w-4xl">
        <div className="card-body p-4 sm:p-8">
          
          <div className="flex flex-col gap-3">
            {upcomingWeeks.map((item, index) => {
              const dateString = formatWeekRange(item.weekStart, item.weekEnd);
              const isCurrentWeek = index === 0; 
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl text-center text-lg font-medium border flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 transition-all
                    ${isCurrentWeek 
                      ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400 shadow-md' 
                      : 'bg-base-200 border-base-300 text-base-content/80 hover:bg-base-300'}`
                  }
                >
                  <span className="w-48 text-right hidden sm:block">{dateString}</span>
                  <span className="sm:hidden">{dateString}</span>
                  
                  <span className="hidden sm:block opacity-50">-</span>
                  
                  <span className={`w-48 text-left ${isCurrentWeek ? 'font-bold' : ''}`}>
                    {item.shiftName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}