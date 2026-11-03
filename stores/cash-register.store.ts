import { create } from 'zustand';
import {
  CashSession,
  OpenCashSessionDto,
  CloseCashSessionDto,
} from '@/types/cash-register.types';
import {
  getCurrentCashSession,
  openCashSession,
  closeCashSession,
  getCashSessionHistory,
} from '@/services/cash-register.service';

interface CashRegisterState {
  currentSession: CashSession | null;
  history: CashSession[];
  isLoading: boolean;
  error: string | null;

  fetchCurrentSession: () => Promise<CashSession | null>;
  fetchHistory: () => Promise<void>;
  openSession: (dto: OpenCashSessionDto) => Promise<CashSession>;
  closeSession: (id: string, dto: CloseCashSessionDto) => Promise<CashSession>;
  clearState: () => void;
}

export const useCashRegisterStore = create<CashRegisterState>((set) => ({
  currentSession: null,
  history: [],
  isLoading: false,
  error: null,

  fetchCurrentSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await getCurrentCashSession();
      set({ currentSession: session, isLoading: false });
      return session;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al consultar caja actual';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  fetchHistory: async () => {
    try {
      const data = await getCashSessionHistory();
      set({ history: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar historial de caja';
      set({ error: message });
    }
  },

  openSession: async (dto: OpenCashSessionDto) => {
    set({ isLoading: true, error: null });
    try {
      const newSession = await openCashSession(dto);
      set((state) => ({
        currentSession: newSession,
        history: [newSession, ...state.history],
        isLoading: false,
      }));
      return newSession;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al abrir caja';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  closeSession: async (id: string, dto: CloseCashSessionDto) => {
    set({ isLoading: true, error: null });
    try {
      const closedSession = await closeCashSession(id, dto);
      set((state) => ({
        currentSession: null,
        history: state.history.map((s) => (s.id === id ? closedSession : s)),
        isLoading: false,
      }));
      return closedSession;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cerrar caja';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearState: () => {
    set({ currentSession: null, history: [], error: null, isLoading: false });
  },
}));
