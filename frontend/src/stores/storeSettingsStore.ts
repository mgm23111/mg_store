import { create } from 'zustand';
import { StoreSettings } from '../types';
import { storeSettingsService } from '../api/storeSettingsService';

interface StoreSettingsState {
  settings: StoreSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  setSettings: (settings: StoreSettings) => void;
}

const defaultSettings: StoreSettings = {
  id: 1,
  companyName: 'MG Store',
  logoUrl: null,
};

export const useStoreSettingsStore = create<StoreSettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: false,
  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const settings = await storeSettingsService.getSettings();
      set({ settings });
    } catch (error) {
      // Keep defaults if API fails
    } finally {
      set({ isLoading: false });
    }
  },
  setSettings: (settings) => set({ settings }),
}));
