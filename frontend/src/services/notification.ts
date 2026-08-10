/**
 * 🔔 Notification Service
 */
import { api } from '@/lib/api'
import type { NotificationResponse, MessageResponse } from '@/lib/types'

export async function getNotifications(page: number = 0, size: number = 20): Promise<{ content: NotificationResponse[]; totalElements: number }> {
  return api.get(`/notifications?page=${page}&size=${size}`)
}

export async function getUnreadCount(): Promise<number> {
  return api.get<number>('/notifications/unread-count')
}

export async function markAsRead(id: number): Promise<MessageResponse> {
  return api.put<MessageResponse>(`/notifications/${id}/read`)
}
