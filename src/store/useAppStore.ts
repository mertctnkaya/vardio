import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js'; // Session eklendi
import type { UserSettings } from '../types';

interface AppState {
  user: User | null;
  session: Session | null; // Session eklendi
  settings: UserSettings | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void; // Eksik olan fonksiyon eklendi
  setSettings: (settings: UserSettings | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  session: null,
  settings: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }), // Fonksiyonun işlevi eklendi
  setSettings: (settings) => set({ settings }),
}));