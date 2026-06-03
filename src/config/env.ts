/** Lectura central y tipada de las variables de entorno (Vite). */
export const env = {
  api: {
    url: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000',
  },
  giphyKey: import.meta.env.VITE_GIPHY_KEY ?? '',
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
} as const

export const isFirebaseConfigured = Boolean(env.firebase.apiKey)
