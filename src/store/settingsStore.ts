import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReaderSettings } from '../types';
import { zustandStorage } from '../utils/storage';

interface SettingsState extends ReaderSettings {
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setParagraphSpacing: (spacing: number) => void;
  setMarginHorizontal: (margin: number) => void;
  setMarginVertical: (margin: number) => void;
  setFontFamily: (family: string) => void;
  setTheme: (theme: string) => void;
  setKeepScreenOn: (keep: boolean) => void;
  setShowStatusBar: (show: boolean) => void;
  setFlipType: (type: ReaderSettings['flipType']) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 18,
      lineHeight: 1.6,
      paragraphSpacing: 12,
      marginHorizontal: 20,
      marginVertical: 16,
      fontFamily: 'System',
      theme: 'vellum',
      keepScreenOn: true,
      showStatusBar: false,
      flipType: 'slide',

      setFontSize: (size) => set({ fontSize: size }),
      setLineHeight: (height) => set({ lineHeight: height }),
      setParagraphSpacing: (spacing) => set({ paragraphSpacing: spacing }),
      setMarginHorizontal: (margin) => set({ marginHorizontal: margin }),
      setMarginVertical: (margin) => set({ marginVertical: margin }),
      setFontFamily: (family) => set({ fontFamily: family }),
      setTheme: (theme) => set({ theme }),
      setKeepScreenOn: (keep) => set({ keepScreenOn: keep }),
      setShowStatusBar: (show) => set({ showStatusBar: show }),
      setFlipType: (type) => set({ flipType: type }),
    }),
    {
      name: 'prism-settings',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
