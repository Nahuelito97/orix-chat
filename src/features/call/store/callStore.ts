import { create } from 'zustand'

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected'

interface CallStore {
  status: CallStatus
  peerUserId: string | null
  peerName: string
  video: boolean
  micOn: boolean
  camOn: boolean
  screening: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  set: (partial: Partial<CallStore>) => void
  reset: () => void
}

const initial = {
  status: 'idle' as CallStatus,
  peerUserId: null,
  peerName: '',
  video: false,
  micOn: true,
  camOn: true,
  screening: false,
  localStream: null,
  remoteStream: null,
}

export const useCallStore = create<CallStore>((set) => ({
  ...initial,
  set: (partial) => set(partial),
  reset: () => set(initial),
}))
