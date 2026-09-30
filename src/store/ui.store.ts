import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI State Store — Transient UI state ONLY.
 *
 * STRICT RULE (from PRD): This store is for UI concerns only.
 * PROHIBITED: Storing API responses, database entities, or auth state here.
 * All server/remote state belongs to TanStack Query.
 *
 * NOTE: zustand/context was removed in Zustand v5.
 * If you need per-component scoped state, use `zustand/vanilla` + React Context.
 */
interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // ─── Sidebar ────────────────────────────────────────────────────────
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // ─── Theme ──────────────────────────────────────────────────────────
      // Default: system — respects prefers-color-scheme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage', // localStorage key
      partialize: (state) => ({
        // Only persist theme preference — sidebar state is transient
        theme: state.theme,
      }),
    }
  )
);
