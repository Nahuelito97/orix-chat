import { create } from 'zustand'

interface AuthStore {
  /** ¿Ya resolvió Firebase el estado inicial de sesión? */
  ready: boolean
  /** uid del usuario logueado (null = invitado). */
  uid: string | null
  setReady: (ready: boolean) => void
  setUid: (uid: string | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  ready: false,
  uid: null,
  setReady: (ready) => set({ ready }),
  setUid: (uid) => set({ uid }),
}))
