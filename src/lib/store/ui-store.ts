import { create } from "zustand";

export interface UIState {
  isSidebarOpen: boolean;
  isHeaderVisible: boolean;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setHeaderVisible: (visible: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isHeaderVisible: true,
  theme: "system",
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setHeaderVisible: (visible) => set({ isHeaderVisible: visible }),
  setTheme: (theme) => set({ theme }),
})); 