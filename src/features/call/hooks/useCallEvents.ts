import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketService } from '../../../services/socket.service'
import { callService } from '../../../services/call.service'
import { queryKeys } from '../../../lib/queryKeys'
import type { ChatSummary } from '../../../types'

/** Conecta los eventos de señalización de llamadas al motor WebRTC. */
export function useCallEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let cleanup = () => {}

    void socketService.connect().then((socket) => {
      const onIncoming = ({
        fromUserId,
        video,
      }: {
        fromUserId: string
        chatId: string
        video: boolean
      }) => {
        // Resolvemos el nombre del que llama desde la cache de chats.
        const chats = queryClient.getQueryData<ChatSummary[]>(queryKeys.chats)
        const peer = chats
          ?.flatMap((c) => c.participants)
          .find((p) => p.id === fromUserId)
        const name = peer?.name || `@${peer?.username ?? '...'}`
        callService.onIncoming(fromUserId, video, name)
      }

      const onAccepted = ({ fromUserId }: { fromUserId: string }) =>
        void callService.onAccepted(fromUserId)
      const onRejected = () => callService.onEnded()
      const onSignal = ({
        fromUserId,
        data,
      }: {
        fromUserId: string
        data: unknown
      }) => void callService.onSignal(fromUserId, data)
      const onEnded = () => callService.onEnded()

      socket.on('call:incoming', onIncoming)
      socket.on('call:accepted', onAccepted)
      socket.on('call:rejected', onRejected)
      socket.on('call:signal', onSignal)
      socket.on('call:ended', onEnded)

      cleanup = () => {
        socket.off('call:incoming', onIncoming)
        socket.off('call:accepted', onAccepted)
        socket.off('call:rejected', onRejected)
        socket.off('call:signal', onSignal)
        socket.off('call:ended', onEnded)
      }
    })

    return () => cleanup()
  }, [queryClient])
}
