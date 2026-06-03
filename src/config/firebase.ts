import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { env } from './env'

/**
 * Init de Firebase. Se usa SOLO para Auth (email/pass + Google) y Storage.
 * Los datos del chat viven en el backend NestJS (ver `services/`).
 */
export const app = initializeApp(env.firebase)
export const auth = getAuth(app)
export const storage = getStorage(app)
