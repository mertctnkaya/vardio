import type { Reminder } from '../../types';
import type { RemindersListProps } from '../../types/currentShift';

export default function RemindersList({ reminders, onToggle, onDelete, onOpenModal }: RemindersListProps) {
  
  // Görsel/Yardımcı Fonksiyonlar (Sadece burada kullanıldığı için içeri taşıdık)
  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getStatusBadge = (rem: Reminder) => {
    if (rem.is_completed) return null;
    const targetDate = new Date(rem.end_date || rem.date);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Süresi Geçti</span>;
    if (diffDays >= 0 && diffDays <= 2) return <span className="bg-orange-900/40 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Yaklaşıyor</span>;
    return null;
  };

  return (
    <div className="md:col-span-2 mt-4 bg-[#1e2329] rounded-xl border border-base-300 shadow-xl overflow-hidden animate-fade-in">
      <div className="bg-base-200 border-b border-base-300 p-4 flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Hatırlatmalar
        </h3>
        <button onClick={onOpenModal} className="btn btn-sm btn-outline hover:bg-indigo-600 hover:text-white border-base-content/20">
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
                    onChange={() => onToggle(rem.id, rem.is_completed)}
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
                <button onClick={() => onDelete(rem.id)} className="btn btn-sm btn-ghost p-3 bg-red-800 text-red-400 hover:bg-red-900/20 w-full sm:w-auto">Sil</button>
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
  );
}