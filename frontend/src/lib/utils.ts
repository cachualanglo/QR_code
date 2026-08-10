/**
 * 🔧 Functional Utils — Ramda-powered helpers
 * Sử dụng Ramda cho các thao tác đơn giản (map, filter, groupBy, split)
 * Dùng plain functions cho pipeline phức tạp để tránh runtime issues
 *
 * Usage:
 *   import { formatDuration, splitSeconds, countByStatus } from '@/lib/utils'
 */

import * as R from 'ramda'

// ─── Types ──────────────────────────────────────────────
export type AttendanceStatus = 'on-time' | 'late' | 'missing-checkout' | 'absent' | 'rest'

export interface AttendanceRecord {
  day: string
  date: number
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
}

export interface DayDetail {
  day: string
  time: string
  badge: string
  badgeColor: string
  status: AttendanceStatus
}

// ─── Status Config ──────────────────────────────────────
const statusConfig: Record<AttendanceStatus, { badge: string; badgeColor: string }> = {
  'on-time':           { badge: 'Đúng giờ',   badgeColor: 'text-success border-success' },
  'late':              { badge: 'Đi trễ',      badgeColor: 'text-warning border-warning' },
  'missing-checkout':  { badge: 'Thiếu ra',    badgeColor: 'text-warning border-warning' },
  'absent':            { badge: 'Vắng mặt',    badgeColor: 'text-error border-error' },
  'rest':              { badge: 'Nghỉ',        badgeColor: 'text-outline-variant border-outline-variant' },
}

export const statusColors: Record<AttendanceStatus, string> = {
  'on-time':          'bg-success',
  'late':             'bg-warning',
  'missing-checkout': 'bg-warning',
  'absent':           'bg-error',
  'rest':             'bg-outline-variant',
}

// ─── Pure Functions (Ramda-powered) ─────────────────────

/**
 * Format duration từ milliseconds → "Xh Ym"
 * @example formatDuration(34200000) → "9h 30m"
 */
export const formatDuration = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

/**
 * Format time string "HH:MM:SS" → { time: "HH:MM", seconds: "SS" }
 * Uses Ramda.split for functional style
 * @example splitSeconds("08:15:32") → { time: "08:15", seconds: "32" }
 */
export const splitSeconds = (time: string): { time: string; seconds: string } => {
  const parts = R.split(':', time)
  return {
    time: `${parts[0]}:${parts[1]}`,
    seconds: parts[2] || '00',
  }
}

/**
 * Chuyển AttendanceRecord → DayDetail
 */
export const toDayDetail = (record: AttendanceRecord): DayDetail => ({
  day: `${record.day}, ${record.date} Tháng 8`,
  time: record.checkIn && record.checkOut
    ? `${record.checkIn} - ${record.checkOut}`
    : record.checkIn
      ? `${record.checkIn} - --:--`
      : '--:-- - --:--',
  badge: statusConfig[record.status].badge,
  badgeColor: statusConfig[record.status].badgeColor,
  status: record.status,
})

/**
 * Nhóm records theo status rồi đếm — Ramda groupBy + mapObjIndexed
 * @example countByStatus(records) → { 'on-time': 3, 'late': 1, ... }
 */
export const countByStatus = (records: AttendanceRecord[]): Record<string, number> => {
  const grouped = R.groupBy(R.prop('status'), records)
  return R.mapObjIndexed(R.length, grouped) as Record<string, number>
}

/**
 * Lọc records chỉ lấy ngày có đi làm — Ramda filter
 */
export const filterWorkDays = (records: AttendanceRecord[]): AttendanceRecord[] =>
  R.filter((r: AttendanceRecord) => r.status !== 'rest' && r.status !== 'absent', records)

/**
 * Lấy color class từ AttendanceRecord
 */
export const getStatusColor = (item: AttendanceRecord): string => statusColors[item.status]

/**
 * Tạo greeting text theo giờ
 */
export const getGreeting = (hour: number): string => {
  if (hour < 12) return 'Chào buổi sáng,'
  if (hour < 18) return 'Chào buổi chiều,'
  return 'Chào buổi tối,'
}

/**
 * Parse date param "10-08-2026" → { day: 10, month: 8, year: 2026 }
 * Uses Ramda.split
 */
export const parseDateParam = (param: string): { day: number; month: number; year: number } => {
  const parts = R.split('-', param)
  return {
    day: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    year: parseInt(parts[2], 10),
  }
}

/**
 * Format parsed date → "Thứ Hai, 10 Tháng 8, 2026"
 */
const dayNames = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const monthNames = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

export const formatVietnameseDate = (param: string): string => {
  const { day, month, year } = parseDateParam(param)
  const date = new Date(year, month - 1, day)
  return `${dayNames[date.getDay()]}, ${day} ${monthNames[month]}, ${year}`
}
