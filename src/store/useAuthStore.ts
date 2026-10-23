import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null, session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true, // Começa carregando para evitar piscar a tela
  
  setUser: (user, session) => set({ user, session, isLoading: false }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));