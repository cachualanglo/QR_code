/**
 * 📋 Attendance Service — Check-in/out + Stats
 */
import { api } from '@/lib/api'
import type {
  AttendanceResponse,
  DayStatsResponse,
  DayDetailResponse,
} from '@/lib/types'

export interface ScanPayload {
  token: string
  latitude?: number
  longitude?: number
  accuracy?: number
}

export async function scanQr(payload: ScanPayload): Promise<AttendanceResponse> {
  return api.post<AttendanceResponse>('/attendance/scan', payload)
}

export async function getDayStats(from: string, to: string): Promise<DayStatsResponse[]> {
  return api.get<DayStatsResponse[]>(`/stats?from=${from}&to=${to}`)
}

export async function getDayDetail(date: string): Promise<DayDetailResponse> {
  return api.get<DayDetailResponse>(`/stats/detail?date=${date}`)
}
