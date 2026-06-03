import { useSocketEvents } from '../hooks/useSocketEvents'
import { useChatStore } from '../store/chatStore'
import { useCallEvents } from '../../call/hooks/useCallEvents'
import CallOverlay from '../../call/components/CallOverlay'
import Sidebar from '../components/Sidebar'
import ConversationPanel from '../components/ConversationPanel'
import ProfilePanel from '../components/ProfilePanel'

export default function ChatPage() {
  useSocketEvents()
  useCallEvents()
  const hasActiveChat = useChatStore((s) => !!s.activeChat)

  return (
    <div className="grid h-screen place-items-center bg-bg p-0 sm:p-4">
      <div className="grid h-full w-full max-w-6xl grid-cols-1 overflow-hidden border border-outline bg-surface sm:h-[92vh] sm:grid-cols-[1fr_1.6fr_1fr] sm:rounded-2xl sm:shadow-2xl sm:shadow-black/30">
        {/* En mobile mostramos una columna a la vez según haya chat abierto. */}
        <div className={hasActiveChat ? 'hidden sm:block' : 'block'}>
          <Sidebar />
        </div>
        <div className={hasActiveChat ? 'block' : 'hidden sm:block'}>
          <ConversationPanel />
        </div>
        <div className="hidden lg:block">
          <ProfilePanel />
        </div>
      </div>
      <CallOverlay />
    </div>
  )
}
