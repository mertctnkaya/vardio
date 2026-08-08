import type { ContactMessage } from "./common";
import type { AdminUser } from "./user";

export interface StatsTabProps {
  stats: { usersCount: number; logsCount: number; remindersCount: number };
}

export interface PremiumTabProps {
  users: AdminUser[];
  actionFeedback: string;
  onGrantPremium: (userId: string, monthsToAdd: number) => void;
  onDeleteAccount: (id: string, email: string) => void;
}

export interface MessagesTabProps {
  messages: ContactMessage[];
  onDeleteMessage: (id: number) => void;
}

export interface BroadcastTabProps {
  title: string;
  message: string;
  isBroadcasting: boolean;
  onTitleChange: (val: string) => void;
  onMessageChange: (val: string) => void;
  onSend: () => void;
}

export interface AdminHeaderProps {
  email: string;
}