import { useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'

/** Refleja el tema elegido en <html data-theme>. */
export function useApplyTheme() {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}
