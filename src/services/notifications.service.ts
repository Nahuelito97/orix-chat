/** Notificaciones del navegador + un beep corto con Web Audio. */

export const notificationsService = {
  isSupported: typeof window !== 'undefined' && 'Notification' in window,

  permission(): NotificationPermission {
    return this.isSupported ? Notification.permission : 'denied'
  },

  /** Pide permiso; devuelve true si quedó concedido. */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  },

  /** Muestra una notificación; al click enfoca la ventana. */
  notify(title: string, body: string) {
    if (!this.isSupported || Notification.permission !== 'granted') return
    const n = new Notification(title, { body, icon: '/vite.svg' })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  },

  /** Beep corto (no requiere archivo de audio). */
  beep() {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new Ctx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 660
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
      osc.start()
      osc.stop(ctx.currentTime + 0.26)
      osc.onended = () => void ctx.close()
    } catch {
      /* sin audio disponible: ignoramos */
    }
  },
}
