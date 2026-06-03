import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type Language } from '../../i18n'

/** Botones ES / EN para cambiar el idioma. */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'es') as Language

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-outline text-xs">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          className={`px-2 py-1 font-medium uppercase transition ${
            current === lng
              ? 'bg-primary text-on-accent'
              : 'bg-surface text-content-muted hover:text-content'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
