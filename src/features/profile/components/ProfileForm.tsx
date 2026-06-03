import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { uploadFile } from '../../../services/storage.service'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import type { UserData } from '../../../types'

/** Recibe el perfil ya cargado e inicializa el estado a partir de él. */
export default function ProfileForm({ user }: { user: UserData }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio)
  const [avatar] = useState(user.avatar)
  const [file, setFile] = useState<File | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (updateProfile.isPending) return
    try {
      let avatarUrl = avatar
      if (file) avatarUrl = await uploadFile(file, 'avatars')
      await updateProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatarUrl,
      })
      toast.success(t('profile.saved'))
      navigate('/chat')
    } catch {
      toast.error(t('profile.saveError'))
    }
  }

  const preview = file ? URL.createObjectURL(file) : avatar

  return (
    <form
      onSubmit={handleSave}
      className="w-full max-w-md rounded-2xl border border-outline bg-surface p-6 shadow-xl"
    >
      <h1 className="mb-6 text-xl font-bold">{t('profile.title')}</h1>

      <label className="mb-6 flex cursor-pointer items-center gap-4">
        <Avatar src={preview} name={name || user.username} size={72} />
        <div>
          <span className="block text-sm font-medium text-primary">
            {t('profile.changePhoto')}
          </span>
          <span className="text-xs text-content-muted">
            {t('profile.photoHint')}
          </span>
        </div>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mb-4">
        <Input
          label={t('profile.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.namePlaceholder')}
        />
      </div>

      <label className="mb-6 block">
        <span className="mb-1.5 block text-sm text-content-muted">
          {t('profile.bio')}
        </span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder={t('profile.bioPlaceholder')}
          className="w-full resize-none rounded-xl border border-outline bg-bg px-3.5 py-2.5 outline-none focus:border-primary"
        />
      </label>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => navigate('/chat')}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" fullWidth disabled={updateProfile.isPending}>
          {updateProfile.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}
