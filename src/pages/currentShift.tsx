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
  const [reminderDate, setReminderDate] = useState(formattedDateValue);

  const fetchReminders = async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (data) setReminders(data);
  }

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setTargetDate(new Date(e.target.value));
      setReminderDate(e.target.value);
    }
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + days);
    setTargetDate(newDate);
    setReminderDate(newDate.toISOString().split("T")[0]);
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
      date: reminderDate,
      content: reminderText,
      is_completed: false
    });

    if (!error) {
      setReminderText('');
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

      {/* ========================================= */}
      {/* HATIRLATMALAR (REMINDERS) MODÜLÜ          */}
      {/* ========================================= */}
      <div className="md:col-span-2 mt-2 bg-[#1e2329] rounded-xl border border-base-300 shadow-xl overflow-hidden animate-fade-in">
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
                <div key={rem.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${rem.is_completed ? 'bg-base-300/50 border-base-300/50 opacity-60' : 'bg-base-100 border-base-300 shadow-sm'}`}>
                  <div className="flex items-start gap-4 mb-3 sm:mb-0">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary mt-1" 
                      checked={rem.is_completed}
                      onChange={() => toggleReminder(rem.id, rem.is_completed)}
                    />
                    <div>
                      <p className={`font-medium ${rem.is_completed ? 'line-through text-base-content/50' : 'text-base-content'}`}>{rem.content}</p>
                      <p className="text-xs text-indigo-400 mt-1">{new Date(rem.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(rem.id)} className="btn btn-sm btn-ghost text-red-400 hover:bg-red-900/20 w-full sm:w-auto">Sil</button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#16191d] rounded-2xl w-full max-w-md shadow-2xl border border-base-300 overflow-hidden">
            <div className="bg-base-200 p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="font-bold text-lg text-indigo-400">Yeni Hatırlatma</h3>
              <button onClick={() => setShowReminderModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold">Tarih</span></label>
                <input 
                  type="date" 
                  className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500" 
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold">Notunuz</span></label>
                <textarea 
                  className="textarea textarea-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 h-24 pt-3" 
                  placeholder="Mesai talebi, doktor randevusu vs..."
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                ></textarea>
              </div>
              <button 
                onClick={handleAddReminder} 
                disabled={isSavingReminder || !reminderText.trim()}
                className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
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