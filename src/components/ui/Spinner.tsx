import { useTranslation } from 'react-i18next'

/** Pantalla de carga centrada a pantalla completa. */
export default function Spinner() {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-screen place-items-center bg-bg text-content-muted">
      {t('common.loading')}
    </div>
  )
}
