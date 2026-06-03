import { useSettingsStore } from '../../features/settings/store/settingsStore'

/** Botón sol/luna para alternar tema claro/oscuro. */
export default function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme)
  const toggleTheme = useSettingsStore((s) => s.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-outline bg-surface px-2 py-1 text-content-muted transition hover:text-content"
      title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
