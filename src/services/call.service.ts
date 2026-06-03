import { socketService } from './socket.service'
import { useCallStore } from '../features/call/store/callStore'

/**
 * Motor de llamadas WebRTC 1-a-1. El gateway Socket.IO hace de signaling:
 * intercambiamos SDP (offer/answer) y candidatos ICE vía `call:signal`.
 */
const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

let pc: RTCPeerConnection | null = null
let pendingCandidates: RTCIceCandidateInit[] = []
let cameraTrack: MediaStreamTrack | null = null // cámara guardada mientras se comparte pantalla

const store = () => useCallStore.getState()

function getMedia(video: boolean): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video })
}

function createPeer(peerUserId: string): RTCPeerConnection {
  const peer = new RTCPeerConnection(ICE_CONFIG)
  peer.onicecandidate = (e) => {
    if (e.candidate) {
      socketService.get()?.emit('call:signal', {
        toUserId: peerUserId,
        data: { candidate: e.candidate.toJSON() },
      })
    }
  }
  peer.ontrack = (e) => store().set({ remoteStream: e.streams[0] })
  pc = peer
  return peer
}

function cleanup() {
  pc?.close()
  pc = null
  pendingCandidates = []
  store().localStream?.getTracks().forEach((t) => t.stop())
  store().reset()
}

export const callService = {
  /** Inicia una llamada hacia `peerUserId`. */
  async startCall(
    peerUserId: string,
    chatId: string,
    peerName: string,
    video: boolean,
  ) {
    const stream = await getMedia(video)
    store().set({
      status: 'calling',
      peerUserId,
      peerName,
      video,
      micOn: true,
      camOn: video,
      localStream: stream,
    })
    socketService.get()?.emit('call:invite', { toUserId: peerUserId, chatId, video })
  },

  /** (Receptor) Llamada entrante: muestra el prompt. */
  onIncoming(fromUserId: string, video: boolean, peerName: string) {
    store().set({
      status: 'incoming',
      peerUserId: fromUserId,
      peerName,
      video,
    })
  },

  /** (Receptor) Acepta: pide media y avisa al que llama. */
  async accept() {
    const { peerUserId, video } = store()
    if (!peerUserId) return
    const stream = await getMedia(video)
    store().set({ status: 'connected', localStream: stream, micOn: true, camOn: video })
    socketService.get()?.emit('call:accept', { toUserId: peerUserId })
  },

  reject() {
    const { peerUserId } = store()
    if (peerUserId) socketService.get()?.emit('call:reject', { toUserId: peerUserId })
    cleanup()
  },

  /** (Emisor) El otro aceptó: creamos la offer. */
  async onAccepted(fromUserId: string) {
    const peer = createPeer(fromUserId)
    store().localStream?.getTracks().forEach((t) => peer.addTrack(t, store().localStream!))
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    socketService.get()?.emit('call:signal', {
      toUserId: fromUserId,
      data: { sdp: peer.localDescription },
    })
    store().set({ status: 'connected' })
  },

  /** Manejo de SDP y candidatos ICE. */
  async onSignal(fromUserId: string, data: unknown) {
    const payload = data as {
      sdp?: RTCSessionDescriptionInit
      candidate?: RTCIceCandidateInit
    }

    if (payload.sdp) {
      // El receptor crea el peer al llegar la offer.
      if (!pc) {
        const peer = createPeer(fromUserId)
        store()
          .localStream?.getTracks()
          .forEach((t) => peer.addTrack(t, store().localStream!))
      }
      await pc!.setRemoteDescription(payload.sdp)
      // Vaciamos candidatos que llegaron antes de la descripción remota.
      for (const c of pendingCandidates) await pc!.addIceCandidate(c)
      pendingCandidates = []

      if (payload.sdp.type === 'offer') {
        const answer = await pc!.createAnswer()
        await pc!.setLocalDescription(answer)
        socketService.get()?.emit('call:signal', {
          toUserId: fromUserId,
          data: { sdp: pc!.localDescription },
        })
      }
    } else if (payload.candidate) {
      if (pc?.remoteDescription) await pc.addIceCandidate(payload.candidate)
      else pendingCandidates.push(payload.candidate)
    }
  },

  hangup() {
    const { peerUserId } = store()
    if (peerUserId) socketService.get()?.emit('call:end', { toUserId: peerUserId })
    cleanup()
  },

  onEnded() {
    cleanup()
  },

  toggleMic() {
    const track = store().localStream?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    store().set({ micOn: track.enabled })
  },

  toggleCam() {
    const track = store().localStream?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    store().set({ camOn: track.enabled })
  },

  /** Comparte/deja de compartir pantalla en una videollamada. */
  async toggleScreen() {
    if (!pc) return
    const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
    if (!sender) return // llamada solo de audio: no hay pista de video

    if (store().screening) {
      // Volver a la cámara.
      if (cameraTrack) await sender.replaceTrack(cameraTrack)
      this.swapLocalVideo(cameraTrack)
      cameraTrack = null
      store().set({ screening: false })
      return
    }

    const display = await navigator.mediaDevices.getDisplayMedia({ video: true })
    const screenTrack = display.getVideoTracks()[0]
    cameraTrack = sender.track ?? null
    await sender.replaceTrack(screenTrack)
    this.swapLocalVideo(screenTrack)
    store().set({ screening: true })
    // Si el usuario corta desde la UI del navegador, restauramos.
    screenTrack.onended = () => void this.toggleScreen()
  },

  /** Refleja la pista de video activa en el preview local. */
  swapLocalVideo(track: MediaStreamTrack | null) {
    const local = store().localStream
    if (!local || !track) return
    local.getVideoTracks().forEach((t) => local.removeTrack(t))
    local.addTrack(track)
    store().set({ localStream: local })
  },
}
