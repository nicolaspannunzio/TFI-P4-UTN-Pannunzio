import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
}

const applyDarkClass = (isDark: boolean) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", isDark);
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      darkMode: true,
      toggleTheme: () => {
        const next = !get().darkMode;
        applyDarkClass(next);
        set({ darkMode: next });
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDarkClass(state.darkMode);
        }
      },
    }
  )
);