import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface AppState {
  // Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Mobile drawer state
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Command palette state
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Theme state
  themePreference: ThemePreference;
  isDarkMode: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleDarkMode: () => void;
}

function applyThemeToDocument(isDark: boolean) {
  if (typeof document !== "undefined") {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

      isMobileNavOpen: false,
      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

      isCommandPaletteOpen: false,
      openCommandPalette: () => set({ isCommandPaletteOpen: true }),
      closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

      themePreference: "system",
      isDarkMode: false,

      setTheme: (pref: ThemePreference) => {
        let isDark = false;
        if (pref === "dark") {
          isDark = true;
        } else if (pref === "light") {
          isDark = false;
        } else {
          // system
          isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        if (typeof localStorage !== "undefined") {
          localStorage.setItem("klyro_theme", pref);
        }
        applyThemeToDocument(isDark);
        set({ themePreference: pref, isDarkMode: isDark });
      },

      toggleDarkMode: () => {
        const currentIsDark = get().isDarkMode;
        const nextIsDark = !currentIsDark;
        const nextPref = nextIsDark ? "dark" : "light";

        if (typeof localStorage !== "undefined") {
          localStorage.setItem("klyro_theme", nextPref);
        }
        applyThemeToDocument(nextIsDark);
        set({ themePreference: nextPref, isDarkMode: nextIsDark });
      },
    }),
    {
      name: "klyro-storage",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        themePreference: state.themePreference,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
