import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from '../config/firebase'

/** Sube un archivo a Firebase Storage y devuelve la URL pública. */
export function uploadFile(file: File, folder = 'uploads'): Promise<string> {
  const path = `${folder}/${Date.now()}-${file.name}`
  const task = uploadBytesResumable(ref(storage, path), file)
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      undefined,
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    )
  })
}
