import { create } from 'zustand';
import { User, HistoryItem, AnalysisResult } from '../types';

interface AppState {
  user: User | null;
  history: HistoryItem[];
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  loadingMessage: string;
  showHistory: boolean;
  showAdminPanel: boolean;
  showPricing: boolean;
  showSupport: boolean;
  showAbout: boolean;
  isCameraOpen: boolean;
  image: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setHistory: (history: HistoryItem[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  setLoadingMessage: (message: string) => void;
  setShowHistory: (show: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowPricing: (show: boolean) => void;
  setShowSupport: (show: boolean) => void;
  setShowAbout: (show: boolean) => void;
  setIsCameraOpen: (open: boolean) => void;
  setImage: (image: string | null) => void;
  
  // Async Actions
  fetchUser: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  history: [],
  isAnalyzing: false,
  result: null,
  error: null,
  loadingMessage: 'Initializing analysis...',
  showHistory: false,
  showAdminPanel: false,
  showPricing: false,
  showSupport: false,
  showAbout: false,
  isCameraOpen: false,
  image: null,

  setUser: (user) => set({ user }),
  setHistory: (history) => set({ history }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),
  setShowHistory: (show) => set({ showHistory: show }),
  setShowAdminPanel: (show) => set({ showAdminPanel: show }),
  setShowPricing: (show) => set({ showPricing: show }),
  setShowSupport: (show) => set({ showSupport: show }),
  setShowAbout: (show) => set({ showAbout: show }),
  setIsCameraOpen: (open) => set({ isCameraOpen: open }),
  setImage: (image) => set({ image }),

  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user });
        get().fetchHistory();
      }
    } catch (err) {
      console.error("Auth check failed", err);
    }
  },

  fetchHistory: async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        set({ 
          history: data.map((item: any) => ({
            ...item,
            id: item._id,
            date: new Date(item.date).toLocaleString()
          })) 
        });
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, history: [] });
  },
}));
