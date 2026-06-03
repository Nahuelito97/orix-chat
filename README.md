# OrixChat 💬

Chat full-stack en **tiempo real** con **React 19 + TypeScript + Vite + Firebase**, tema **Orix Dusk** (índigo + peach/coral, dark-first). Inspirado en el tutorial de GreatStack, reescrito en TS y con la paleta Orix.

## Features

- 🔐 Registro / login con **Firebase Auth** (email + contraseña)
- ⚡ Mensajes en **tiempo real** con `onSnapshot` de Firestore
- 🔎 Buscar usuarios por `@username` y crear chats
- 🖼️ Enviar imágenes (avatar + mensajes) con **Firebase Storage**
- 🟢 Estado "en línea" por `lastSeen` (heartbeat cada 60s)
- 👤 Edición de perfil (nombre, bio, avatar)
- ✅ Marcado de "no leído" por chat

## Stack

| Capa    | Tecnología                          |
| ------- | ----------------------------------- |
| Front   | React 19, TypeScript, Vite          |
| Estilos | Tailwind v4 (`@theme` Orix)         |
| Backend | Firebase Auth · Firestore · Storage |
| Routing | react-router-dom                    |
| Notifs  | react-toastify                      |

## Arranque

```bash
npm install
npm run dev      # http://localhost:5173
```

## Configurar Firebase (el único paso pendiente)

1. Creá un proyecto en https://console.firebase.google.com
2. **Authentication** → Sign-in method → activá **Email/Password**.
3. **Firestore Database** → Crear (modo producción).
4. **Storage** → Crear.
5. Project settings → tus apps → **Web app** → copiá el objeto `firebaseConfig`.
6. Pegá los valores en `.env` (basado en `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

7. Reiniciá `npm run dev`. Listo.

> Toda la config vive en `.env` → `src/config/firebase.ts`. No hay que tocar código.

## Reglas de seguridad (pegar en la consola)

**Firestore** (Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    match /chats/{uid} {
      // ambos participantes actualizan la lista de chats
      allow read, write: if request.auth != null;
    }
    match /messages/{id} {
      allow read, write: if request.auth != null;
    }
    match /typing/{id} {
      // indicador "escribiendo…"
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage** (Rules):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

> Reglas pensadas para desarrollo. Antes de producción conviene acotar `chats`/`messages` a los participantes reales.

## Modelo de datos (Firestore)

```
users/{uid}      → { id, username, name, email, bio, avatar, lastSeen }
chats/{uid}      → { chatsData: [{ messageId, rId, lastMessage, updatedAt, messageSeen }] }
messages/{msgId} → { messages: [{ sId, text?, image?, createdAt }] }
typing/{msgId}   → { [uid]: timestamp }   // indicador "escribiendo…"
```

## Estructura

```
src/
  config/firebase.ts      init + helpers de auth (signup/login/logout)
  context/AppContext.tsx  estado global + suscripciones realtime
  lib/upload.ts           subida a Storage
  types/index.ts          tipos compartidos
  pages/      Login · Chat · ProfileUpdate
  components/ LeftSidebar · ChatBox · RightSidebar · Avatar
```
