/**
 * 📝 API Types — Typed interfaces matching backend DTOs
 */

// ─── Auth ───────────────────────────────────────────────
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken: string
}

// ─── Attendance ─────────────────────────────────────────
export interface ScanRequest {
  token: string
  latitude?: number
  longitude?: number
  accuracy?: number
}

export type QrTokenType = 'CHECK_IN' | 'CHECK_OUT'

export interface QrTokenResponse {
  token: string
  type: QrTokenType
  expiresIn: number
}

export interface AttendanceResponse {
  action?: 'CHECK_IN' | 'CHECK_OUT'
  checkInAt?: string
  checkOutAt?: string
  status?: 'PRESENT' | 'LATE' | 'EARLY_LEAVE'
  lateMinutes?: number
  earlyLeaveMinutes?: number
  message?: string
}

export interface DayStatsResponse {
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: string // ON_TIME / LATE / ABSENT / DAY_OFF / MISSING_CHECKOUT
}

export interface DayDetailResponse {
  date: string
  checkInTime?: string
  checkOutTime?: string
  checkInLat?: number
  checkInLng?: number
  checkInDistanceM?: number
  checkInAccuracy?: number
  checkOutLat?: number
  checkOutLng?: number
  checkOutDistanceM?: number
  checkOutAccuracy?: number
  checkInQrToken?: string
  checkOutQrToken?: string
}

// ─── QR ─────────────────────────────────────────────────
export interface QrResponse {
  token: string
  shiftId?: number
  shiftName?: string
  expiresIn: number
  expiresAt?: number
}

// ─── Shift ──────────────────────────────────────────────
export interface ShiftRequest {
  name: string
  startTime: string    // HH:mm:ss
  endTime: string
  checkinCutoff: string
  qrRotationSeconds: number
  isActive: boolean
}

export interface ShiftResponse {
  id: number
  name: string
  startTime: string
  endTime: string
  checkinCutoff: string
  qrRotationSeconds: number
  isActive: boolean
}

// ─── Admin ──────────────────────────────────────────────
export interface EmployeeResponse {
  id: number
  employeeCode: string
  username: string
  role: string
}

export interface UpdateLocationRequest {
  lat: number
  lng: number
  radiusMeters: number
}

export interface CompanyLocationResponse {
  lat: number
  lng: number
  radiusMeters: number
}

// ─── Notification ───────────────────────────────────────
export interface NotificationResponse {
  id: number
  type: string
  title: string
  message: string
  sentAt: string
  isRead: boolean
}

// ─── Message ────────────────────────────────────────────
export interface MessageResponse {
  ok: boolean
  message: string
}

// ─── Frontend-specific Mapped Types ─────────────────────
export interface UserProfile {
  id: number
  employeeCode: string
  username: string
  role: string
}

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'DAY_OFF' | 'MISSING_CHECKOUT'

export interface DayStats {
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
}

export interface DayStatsResponse {
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: string
}
