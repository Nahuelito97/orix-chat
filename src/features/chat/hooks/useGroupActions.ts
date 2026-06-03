import { useCallback } from 'react'
import { socketService } from '../../../services/socket.service'

/** Acciones de administración de grupos/chats (vía socket). */
export function useGroupActions() {
  const renameGroup = useCallback((chatId: string, name: string) => {
    socketService.get()?.emit('group:update', { chatId, name })
  }, [])

  const setGroupAvatar = useCallback((chatId: string, avatar: string) => {
    socketService.get()?.emit('group:update', { chatId, avatar })
  }, [])

  const addMembers = useCallback((chatId: string, memberIds: string[]) => {
    socketService.get()?.emit('group:addMembers', { chatId, memberIds })
  }, [])

  const removeMember = useCallback((chatId: string, userId: string) => {
    socketService.get()?.emit('group:removeMember', { chatId, userId })
  }, [])

  const leaveGroup = useCallback((chatId: string) => {
    socketService.get()?.emit('chat:leaveGroup', { chatId })
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    socketService.get()?.emit('chat:delete', { chatId })
  }, [])

  return { renameGroup, setGroupAvatar, addMembers, removeMember, leaveGroup, deleteChat }
}
