# OrixChat 💬

Chat **full-stack en tiempo real** con tema **Orix** (índigo + peach/coral, claro y oscuro). Mensajería 1-a-1 y grupal, reacciones, respuestas, edición, recibos de lectura, llamadas y mucho más.

Este repo es el **frontend**. El backend vive en [orix-chat-api](https://github.com/Nahuelito97/orix-chat-api).

## Arquitectura

Híbrido: **Firebase Auth** (login) + **backend NestJS propio** (datos y realtime).

```
┌──────────────┐  Firebase ID token (Bearer)   ┌──────────────────────┐
│  Front        │ ─────────────────────────────▶│  NestJS API          │
│  React + Vite │   REST (perfil, historial)     │  - verifica token     │
│  Firebase Auth│ ◀─────────────────────────────▶│  - Prisma + Postgres  │
│  (Google/mail)│   WebSocket (mensajes, typing, │  - Socket.IO gateway  │
└──────────────┘    presencia, reacciones…)      └──────────────────────┘
```

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | React 19 + TypeScript + Vite |
| Estilos | Tailwind v4 (`@theme` Orix, claro/oscuro) |
| Server-state | TanStack Query |
| Client/UI-state | Zustand |
| Realtime | socket.io-client |
| Auth + Storage | Firebase |
| i18n | i18next (es / en) |

## Features

- 🔐 Login con **Google** y email/contraseña · reset de contraseña · verificación de email
- 💬 Chats **1-a-1 y grupales** (crear grupo, administrar miembros, salir)
- ⚡ Mensajes en tiempo real: texto, **imágenes** y **archivos**
- 😀 **Reacciones**, **responder** (cita), **editar/borrar**, **fijar**, **reenviar**
- ✓✓ Recibos de **enviado / entregado / visto** · indicador "escribiendo…" · presencia online
- 🔎 Búsqueda de usuarios y **búsqueda dentro del chat**
- 🔔 Notificaciones del navegador + sonido · **silenciar** chats
- 🧭 Infinite-scroll del historial · emoji picker · drag & drop / pegar imágenes
- 🌗 Tema **claro/oscuro** · 🌐 **i18n** español / inglés

## Estructura

```
src/
  app/        providers · queryClient · router · ProtectedRoute
  config/     env tipada · firebase (init)
  i18n/       i18next + locales/{es,en}.json
  services/   capa pura: http · auth · users · chats · socket · storage
  features/
    auth/     hooks · components · pages · store
    chat/     hooks · components · store · utils · pages
    profile/  hooks · components · pages
    settings/ store · components · hooks
  components/ui/  Avatar · Button · Input · Modal · Spinner · ThemeToggle · LanguageSwitcher
  hooks/      useDebounce
```

## Arranque

```bash
npm install
cp .env.example .env   # completar con tu firebaseConfig web + URLs del backend
npm run dev            # http://localhost:5173
```

### Variables de entorno (`.env`)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

> Necesitás el [backend](https://github.com/Nahuelito97/orix-chat-api) corriendo para que funcione.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`tsc -b` + `vite build`) |
| `npm run lint` | ESLint |
| `npm run preview` | Previsualiza el build |
