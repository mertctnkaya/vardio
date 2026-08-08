import type { Reminder } from "./user";

export interface DateSelectorCardProps {
  targetDate: Date;
  formattedDateValue: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShiftDate: (days: number) => void;
  onSetToday: () => void;
}

export interface GuestPromoCardProps {
  user: any;
}

export interface NotificationPromoProps {
  showPromo: boolean;
  onRequest: () => void;
  onDismiss: () => void;
}

export interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  user: any;
  onSuccess: () => void;
}

export interface RemindersListProps {
  reminders: Reminder[];
  onToggle: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
  onOpenModal: () => void;
}

export interface ShiftDisplayCardProps {
  currentShift: any;
  shiftHours: string | null;
}

export interface WelcomeBannerProps {
  showWelcome: boolean;
  onClose: () => void;
}