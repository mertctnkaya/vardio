import { useOutletContext } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Reminder } from '../types';

// Makro Componentlerimiz
import DateSelectorCard from '../components/current-shift/DateSelectorCard';
import ShiftDisplayCard from '../components/current-shift/ShiftDisplayCard';
import WelcomeBanner from '../components/current-shift/WelcomeBanner';
import NotificationPromo from '../components/current-shift/NotificationPromo';
import RemindersList from '../components/current-shift/RemindersList';
import ReminderModal from '../components/current-shift/ReminderModal';
import GuestPromoCard from '../components/current-shift/GuestPromoCard';

type ShiftContextType = ReturnType<typeof import("../hooks/useShiftCalculator").useShiftCalculator>;

export default function CurrentShift() {
  // A. Merkezi Durum Yönetimi (State & Context)
  const { targetDate, setTargetDate, currentShift } = useOutletContext<ShiftContextType>();
  const { user, settings } = useAppStore();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showNotificationPromo, setShowNotificationPromo] = useState(false);

  const formattedDateValue = targetDate.toISOString().split("T")[0];

  // B. İş Mantığı (Logic & API)
  useEffect(() => {
    // 1. Bildirim İzni Kontrolü
    if ('Notification' in window) {
      const isDismissed = localStorage.getItem('hideNotificationPromo');
      if (Notification.permission === 'default' && isDismissed !== 'true') {
        setShowNotificationPromo(true);
      }
    }
    // 2. Hoş Geldin Mesajı Kontrolü
    const isHiddenWelcome = localStorage.getItem('hideWelcomeInfo');
    if (isHiddenWelcome !== 'true') {
      setShowWelcome(true);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('reminders')
      .select('*').eq('user_id', user.id)
      .order('is_completed', { ascending: true })
      .order('date', { ascending: true });
    if (data) setReminders(data);
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // C. Yardımcı Fonksiyonlar (Handlers & Calculators)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) setTargetDate(new Date(e.target.value));
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + days);
    setTargetDate(newDate);
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
    let duration = 8, offset = 0;

    if (type === 'fixed') return `${start} - ${settings.shift_end_time || '18:00'}`;
    if (type === '2-shift') {
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

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in w-full pb-10">

      {/* Tarih Seçici Kart */}
      <DateSelectorCard 
        targetDate={targetDate}
        formattedDateValue={formattedDateValue}
        onDateChange={handleDateChange}
        onShiftDate={shiftDate}
        onSetToday={() => setTargetDate(new Date())}
      />

      {/* Vardiya Gösterici Kart */}
      <ShiftDisplayCard 
        currentShift={currentShift}
        shiftHours={getShiftHours()}
      />

      {/* Hoş Geldin & Bildirim Uyarıları */}
      <WelcomeBanner 
        showWelcome={showWelcome} 
        onClose={() => { localStorage.setItem('hideWelcomeInfo', 'true'); setShowWelcome(false); }} 
      />
      
      <NotificationPromo 
        showPromo={showNotificationPromo} 
        onRequest={() => {
          if (!('Notification' in window)) return;
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') alert('Harika! Artık bildirim alacaksınız.');
            localStorage.setItem('hideNotificationPromo', 'true');
            setShowNotificationPromo(false);
          });
        }} 
        onDismiss={() => { localStorage.setItem('hideNotificationPromo', 'true'); setShowNotificationPromo(false); }} 
      />

      {/* Hatırlatmalar Modülü */}
      <RemindersList 
        reminders={reminders}
        onToggle={async (id, status) => { await supabase.from('reminders').update({ is_completed: !status }).eq('id', id); fetchReminders(); }}
        onDelete={async (id) => { await supabase.from('reminders').delete().eq('id', id); fetchReminders(); }}
        onOpenModal={() => setShowReminderModal(true)}
      />

      {/* Modallar ve Misafir Paneli */}
      <ReminderModal 
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        defaultDate={formattedDateValue}
        user={user}
        onSuccess={() => { setShowReminderModal(false); fetchReminders(); }}
      />

      <GuestPromoCard user={user} />
      
    </div>
  );
}