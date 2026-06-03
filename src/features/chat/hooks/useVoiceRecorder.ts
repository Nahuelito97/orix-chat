import { useRef, useState } from 'react'

/** Graba audio con MediaRecorder. `stop()` resuelve con el Blob grabado. */
export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  async function start(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
      return true
    } catch {
      return false
    }
  }

  function cleanup() {
    clearInterval(timerRef.current)
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    setRecording(false)
  }

  /** Detiene y resuelve con el audio grabado. */
  function stop(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder) return resolve(null)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        cleanup()
        resolve(blob.size > 0 ? blob : null)
      }
      recorder.stop()
    })
  }

  function cancel() {
    const recorder = recorderRef.current
    if (recorder) {
      recorder.onstop = () => cleanup()
      recorder.stop()
    }
    chunksRef.current = []
  }

  return { recording, seconds, start, stop, cancel }
}
