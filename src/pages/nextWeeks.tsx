import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import WeekList from '../components/next-weeks/WeekList';

export default function NextWeeks() {
  const { settings } = useAppStore();

  // Ayarlardan okuyup tam 10 haftalık listeyi oluşturan motor
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

    // 10 haftalık döngü
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

      <WeekList upcomingWeeks={upcomingWeeks} />
    </div>
  );
}