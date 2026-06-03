import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { http } from './http'
import type { UserData } from '../types'

const PENDING_USERNAME = 'orixchat:pendingUsername'

function setPendingUsername(username: string) {
  sessionStorage.setItem(PENDING_USERNAME, username)
}
function takePendingUsername(): string | undefined {
  const v = sessionStorage.getItem(PENDING_USERNAME)
  sessionStorage.removeItem(PENDING_USERNAME)
  return v ?? undefined
}

const googleProvider = new GoogleAuthProvider()

export const authService = {
  /** Registro. El perfil lo crea el backend al sincronizar. */
  async signup(username: string, email: string, password: string) {
    setPendingUsername(username.toLowerCase())
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // Enviamos verificación de email (no bloquea el uso).
    await sendEmailVerification(cred.user).catch(() => {})
  },

  resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email)
  },

  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  },

  loginWithGoogle() {
    return signInWithPopup(auth, googleProvider)
  },

  logout() {
    return signOut(auth)
  },

  /** Crea/actualiza el usuario en el backend a partir del token actual. */
  sync(): Promise<UserData> {
    return http.post<UserData>('/users/sync', {
      username: takePendingUsername(),
    })
  },
}

/** Mapea códigos de error de Firebase a claves de i18n. */
export function authErrorKey(code: string): string {
  const known = [
    'auth/invalid-email',
    'auth/email-already-in-use',
    'auth/weak-password',
    'auth/invalid-credential',
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/too-many-requests',
  ]
  return known.includes(code) ? `authErrors.${code}` : 'authErrors.generic'
}

/** Errores de popup que no valen un toast (el usuario canceló). */
export function isCancelledPopup(code: string): boolean {
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  )
}
