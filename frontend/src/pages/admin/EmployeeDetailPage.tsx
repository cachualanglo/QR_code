import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllEmployees, getEmployeeStats } from '@/services/admin'
import type { EmployeeResponse, DayStatsResponse } from '@/lib/types'

// ─── Types ──────────────────────────────────────────────
interface AttendanceEntry {
  date: string
  weekday: string
  checkIn?: { time: string; distance?: number }
  checkOut?: { time: string; distance?: number }
  status: 'on-time' | 'late' | 'absent'
}

// ─── Status Config ──────────────────────────────────────
const statusBadgeConfig = {
  'on-time': { label: 'Đúng giờ', bg: 'bg-[#e6f4ea]', text: 'text-[#137333]' },
  'late':    { label: 'Đi trễ',    bg: 'bg-[#fff8e1]', text: 'text-[#7c5c00]' },
  'absent':  { label: 'Vắng',      bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
}

const DAYS_HEADER = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// ─── Component ──────────────────────────────────────────
export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [currentMonth] = useState(new Date())
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null)
  const [stats, setStats] = useState<DayStatsResponse[]>([])
  const [loading, setLoading] = useState(true)

  const employeeId = Number(id)

  // Fetch employee data
  useEffect(() => {
    if (!employeeId) return
    setLoading(true)

    async function fetchData() {
      try {
        const [empList, monthStats] = await Promise.all([
          getAllEmployees(),
          getEmployeeStats(employeeId, '2024-01-01', '2026-12-31').catch(() => []),
        ])

        const emp = empList?.find(e => e.id === employeeId) || null
        setEmployee(emp)
        setStats(monthStats || [])
      } catch {
        setEmployee(null)
        setStats([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [employeeId])

  // Build calendar dots from stats
  const calendarDots = useMemo(() => {
    const dots: Record<number, string> = {}
    stats.forEach(s => {
      const day = new Date(s.date).getDate()
      if (s.status === 'ON_TIME') dots[day] = 'bg-[#1a7c3e]'
      else if (s.status === 'LATE') dots[day] = 'bg-[#7c5c00]'
      else if (s.status === 'ABSENT') dots[day] = 'bg-[#ba1a1a]'
    })
    return dots
  }, [stats])

  // Build attendance entries from stats
  const attendanceEntries: AttendanceEntry[] = useMemo(() => {
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return stats
      .filter(s => s.checkInTime || s.status === 'ABSENT')
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(s => {
        const d = new Date(s.date)
        let status: 'on-time' | 'late' | 'absent' = 'absent'
        if (s.status === 'ON_TIME') status = 'on-time'
        else if (s.status === 'LATE') status = 'late'

        return {
          date: s.date,
          weekday: weekdays[d.getDay()],
          checkIn: s.checkInTime ? { time: s.checkInTime.split('T')[1]?.slice(0, 8) || s.checkInTime } : undefined,
          checkOut: s.checkOutTime ? { time: s.checkOutTime.split('T')[1]?.slice(0, 8) || s.checkOutTime } : undefined,
          status,
        }
      })
  }, [stats])

  const emp = employee

  const monthLabel = `Tháng ${currentMonth.getMonth() + 1}, ${currentMonth.getFullYear()}`

  if (loading) {
    return (
      <div className="flex flex-col min-h-0">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!emp) {
    return (
      <div className="flex flex-col min-h-0">
        <div className="flex flex-col items-center justify-center py-12">
          <span className="material-symbols-outlined text-outline-variant text-6xl mb-3">person_off</span>
          <p className="text-lg font-semibold text-on-surface">Không tìm thấy nhân viên</p>
          <button onClick={() => navigate('/admin/employees')} className="mt-4 text-primary text-sm font-medium">← Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-8 flex flex-col gap-5 max-w-xl mx-auto w-full">
        {/* Employee Profile Card */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
              {emp.employeeCode.slice(-2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-on-surface">{emp.employeeCode}</h2>
              <p className="text-sm text-on-surface-variant">Mã NV: {emp.employeeCode}</p>
            </div>
          </div>
          <div className="h-px w-full bg-outline-variant/30" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-lg">badge</span>
              <span className="text-sm text-on-surface">Vai trò: {emp.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-lg">person</span>
              <span className="text-sm text-on-surface">Username: {emp.username}</span>
            </div>
          </div>
        </section>

        {/* Attendance Calendar */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-on-surface">Lịch sử điểm danh</h3>
          <div className="flex justify-between items-center bg-surface-container-low rounded-lg p-2">
            <button className="p-1 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span className="text-xs font-semibold text-on-surface">{monthLabel}</span>
            <button className="p-1 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {DAYS_HEADER.map((d) => (
              <div key={d} className="text-on-surface-variant py-2">{d}</div>
            ))}
            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map((day) => {
              const dotColor = calendarDots[day]
              const isSelected = day === selectedDay
              const isToday = day === new Date().getDate()
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-10 h-10 mx-auto flex flex-col items-center justify-center relative rounded-full transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary font-bold shadow-md'
                      : isToday
                        ? 'border-2 border-primary text-primary font-bold'
                        : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>{day}</span>
                  {dotColor && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                </button>
              )
            })}
          </div>
          <div className="flex gap-4 justify-center text-sm">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1a7c3e]" /> Đúng giờ</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7c5c00]" /> Trễ</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ba1a1a]" /> Vắng</div>
          </div>
        </section>

        {/* Timeline Details */}
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-on-surface">Chi tiết theo ngày</h3>
          {attendanceEntries.length === 0 ? (
            <p className="text-center text-on-surface-variant py-4">Chưa có dữ liệu điểm danh</p>
          ) : (
            attendanceEntries.map((entry, idx) => {
              const badge = statusBadgeConfig[entry.status]
              return (
                <div
                  key={idx}
                  className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-3 relative overflow-hidden border border-outline-variant/30"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                    entry.status === 'on-time' ? 'bg-[#1a7c3e]' : entry.status === 'late' ? 'bg-[#7c5c00]' : 'bg-[#ba1a1a]'
                  }`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{entry.weekday}, {entry.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                  {entry.checkIn && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[#1a7c3e] text-lg">login</span>
                      <span className="text-on-surface-variant">Vào:</span>
                      <span className="font-medium text-on-surface">{entry.checkIn.time}</span>
                    </div>
                  )}
                  {entry.checkOut && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[#ba1a1a] text-lg">logout</span>
                      <span className="text-on-surface-variant">Ra:</span>
                      <span className="font-medium text-on-surface">{entry.checkOut.time}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>
      </div>
    </div>
  )
}
