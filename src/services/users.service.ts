import { http } from './http'
import type { UserData, UserMini } from '../types'

export const usersService = {
  getMe: () => http.get<UserData>('/users/me'),
  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) =>
    http.patch<UserData>('/users/me', data),
  search: (q: string) =>
    http.get<UserMini[]>(`/users/search?q=${encodeURIComponent(q)}`),
}
