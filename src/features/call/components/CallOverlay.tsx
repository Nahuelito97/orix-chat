import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Avatar from '../../../components/ui/Avatar'
import { useCallStore } from '../store/callStore'
import { callService } from '../../../services/call.service'

/** Reproduce un MediaStream en un <video> (local va muteado para evitar eco). */
function MediaView({
  stream,
  muted,
  className,
}: {
  stream: MediaStream | null
  muted: boolean
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream
  }, [stream])
  return (
    <video ref={ref} autoPlay playsInline muted={muted} className={className} />
  )
}

export default function CallOverlay() {
  const { t } = useTranslation()
  const {
    status,
    peerName,
    video,
    micOn,
    camOn,
    localStream,
    remoteStream,
  } = useCallStore()

  if (status === 'idle') return null

  // Llamada entrante: prompt aceptar / rechazar.
  if (status === 'incoming') {
    return (
      <Backdrop>
        <Card>
          <Avatar name={peerName} size={88} />
          <h2 className="mt-3 text-lg font-semibold">{peerName}</h2>
          <p className="text-sm text-content-muted">
            {video ? t('call.incomingVideo') : t('call.incomingAudio')}
          </p>
          <div className="mt-6 flex gap-4">
            <RoundBtn onClick={() => callService.reject()} variant="danger">
              📵
            </RoundBtn>
            <RoundBtn onClick={() => void callService.accept()} variant="success">
              📞
            </RoundBtn>
          </div>
        </Card>
      </Backdrop>
    )
  }

  const isVideo = video && status === 'connected'

  return (
    <Backdrop>
      {isVideo ? (
        <div className="relative h-full w-full">
          <MediaView
            stream={remoteStream}
            muted={false}
            className="h-full w-full bg-black object-cover"
          />
          <MediaView
            stream={localStream}
            muted
            className="absolute bottom-24 right-4 h-40 w-28 rounded-xl border border-outline object-cover shadow-lg"
          />
        </div>
      ) : (
        <Card>
          <Avatar name={peerName} size={96} />
          <h2 className="mt-3 text-lg font-semibold">{peerName}</h2>
          <p className="text-sm text-content-muted">
            {status === 'calling' ? t('call.calling') : t('call.inCall')}
          </p>
          {/* Audio remoto (sin video visible) */}
          <MediaView stream={remoteStream} muted={false} className="hidden" />
        </Card>
      )}

      {/* Controles */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
        <RoundBtn onClick={() => callService.toggleMic()}>
          {micOn ? '🎙️' : '🔇'}
        </RoundBtn>
        {video && (
          <RoundBtn onClick={() => callService.toggleCam()}>
            {camOn ? '📹' : '🚫'}
          </RoundBtn>
        )}
        <RoundBtn onClick={() => callService.hangup()} variant="danger">
          📵
        </RoundBtn>
      </div>
    </Backdrop>
  )
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/95">
      {children}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-outline bg-surface px-10 py-8 text-center shadow-2xl">
      {children}
    </div>
  )
}

function RoundBtn({
  children,
  onClick,
  variant = 'neutral',
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'neutral' | 'danger' | 'success'
}) {
  const colors = {
    neutral: 'bg-surface-variant text-content hover:bg-outline',
    danger: 'bg-danger text-white hover:opacity-90',
    success: 'bg-success text-white hover:opacity-90',
  }
  return (
    <button
      onClick={onClick}
      className={`grid h-14 w-14 place-items-center rounded-full text-2xl shadow-lg transition ${colors[variant]}`}
    >
      {children}
    </button>
  )
}
