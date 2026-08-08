import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { ReminderModalProps } from '../../types/currentShift';

export default function ReminderModal({ isOpen, onClose, defaultDate, user, onSuccess }: ReminderModalProps) {
  // Modal State'leri Ana sayfadan izole edildi (Standartlaştırma / Seiketsu)
  const [reminderStartDate, setReminderStartDate] = useState(defaultDate);
  const [reminderEndDate, setReminderEndDate] = useState('');
  const [reminderTimeRange, setReminderTimeRange] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  // Modal her açıldığında veya takvimden tarih değiştiğinde form başlangıç tarihini eşitler
  useEffect(() => {
    if (isOpen) {
      setReminderStartDate(defaultDate);
    }
  }, [isOpen, defaultDate]);

  if (!isOpen) return null;

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
      onSuccess(); // Ana sayfaya "başarılı oldu, listeyi yenile" der.
    }
    setIsSavingReminder(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-[#16191d] rounded-2xl w-full max-w-md shadow-2xl border border-base-300 overflow-hidden">
        <div className="bg-base-200 p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-bold text-lg text-indigo-400">Yeni Hatırlatma</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-bold text-base-content/80">Başlangıç Tarihi</span></label>
              <input
                type="date"
                className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 text-sm p-3"
                value={reminderStartDate}
                onChange={(e) => setReminderStartDate(e.target.value)}
              />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-bold text-base-content/80">Bitiş (Opsiyonel)</span></label>
              <input
                type="date"
                className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 text-sm p-3"
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
              className="input input-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 placeholder-base-content/30 p-3"
              placeholder="Örn: 14:00 - 16:00"
              value={reminderTimeRange}
              onChange={(e) => setReminderTimeRange(e.target.value)}
            />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-base-content/80">Notunuz</span></label>
            <textarea
              className="textarea textarea-bordered w-full bg-base-200 focus:ring-2 focus:ring-indigo-500 h-24 p-2 resize-none"
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
  );
}