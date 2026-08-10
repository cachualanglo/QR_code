/**
 * 👔 Admin Service — Employee management + QR generation + Shift CRUD
 */
import { api } from '@/lib/api'
import type {
  EmployeeResponse,
  DayStatsResponse,
  DayDetailResponse,
  QrResponse,
  CompanyLocationResponse,
  UpdateLocationRequest,
  MessageResponse,
  ShiftRequest,
  ShiftResponse,
} from '@/lib/types'

// ─── Employees ──────────────────────────────────────────
export async function getAllEmployees(): Promise<EmployeeResponse[]> {
  return api.get<EmployeeResponse[]>('/admin/employees')
}

export async function getEmployeeStats(userId: number, from: string, to: string): Promise<DayStatsResponse[]> {
  return api.get<DayStatsResponse[]>(`/admin/employees/${userId}/stats?from=${from}&to=${to}`)
}

export async function getEmployeeDayDetail(userId: number, date: string): Promise<DayDetailResponse> {
  return api.get<DayDetailResponse>(`/admin/employees/${userId}/detail?date=${date}`)
}

// ─── QR ─────────────────────────────────────────────────
export async function generateQr(type: 'CHECK_IN' | 'CHECK_OUT'): Promise<QrResponse> {
  return api.post<QrResponse>('/qr/generate', { type })
}

// ─── Company Location ───────────────────────────────────
export async function getLocation(): Promise<CompanyLocationResponse> {
  return api.get<CompanyLocationResponse>('/admin/location')
}

export async function updateLocation(data: UpdateLocationRequest): Promise<MessageResponse> {
  return api.put<MessageResponse>('/admin/location', data)
}

// ─── Shift CRUD ────────────────────────────────────────

export async function getAllShifts(): Promise<ShiftResponse[]> {
  return api.get<ShiftResponse[]>('/admin/shifts')
}

export async function createShift(data: ShiftRequest): Promise<ShiftResponse> {
  return api.post<ShiftResponse>('/admin/shifts', data)
}

export async function updateShift(id: number, data: ShiftRequest): Promise<ShiftResponse> {
  return api.put<ShiftResponse>(`/admin/shifts/${id}`, data)
}

export async function deleteShift(id: number): Promise<void> {
  return api.delete(`/admin/shifts/${id}`)
}
