import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface SettingsStore {
  notifications: boolean
  sound: boolean
  theme: Theme
  setNotifications: (v: boolean) => void
  setSound: (v: boolean) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      notifications: false,
      sound: true,
      theme: 'dark',
      setNotifications: (notifications) => set({ notifications }),
      setSound: (sound) => set({ sound }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'orixchat:settings' },
  ),
)
