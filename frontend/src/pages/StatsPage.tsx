import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDayStats } from '@/services/attendance'
import type { DayStatsResponse } from '@/lib/types'

// ─── Helpers ────────────────────────────────────────────
const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function getWeekRange(offset: number = 0): { from: string; to: string; label: string } {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const labelDay = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`

  return {
    from: fmt(monday),
    to: fmt(sunday),
    label: `Tuần ${labelDay(monday)} - ${labelDay(sunday)}`,
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'ON_TIME': return 'bg-success'
    case 'LATE': return 'bg-warning'
    case 'MISSING_CHECKOUT': return 'bg-warning'
    case 'ABSENT': return 'bg-error'
    case 'DAY_OFF': return 'bg-outline-variant'
    default: return 'bg-outline-variant'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ON_TIME': return 'Đúng giờ'
    case 'LATE': return 'Đi trễ'
    case 'MISSING_CHECKOUT': return 'Thiếu Check-out'
    case 'ABSENT': return 'Vắng mặt'
    case 'DAY_OFF': return 'Nghỉ'
    default: return '—'
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'ON_TIME': return 'text-success border-success'
    case 'LATE': return 'text-warning border-warning'
    case 'MISSING_CHECKOUT': return 'text-warning border-warning'
    case 'ABSENT': return 'text-error border-error'
    case 'DAY_OFF': return 'text-outline-variant border-outline-variant'
    default: return 'text-outline-variant border-outline-variant'
  }
}

// ─── Component ──────────────────────────────────────────
export default function StatsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [stats, setStats] = useState<DayStatsResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset])

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDayStats(weekRange.from, weekRange.to)
      setStats(data || [])
    } catch {
      setStats([])
    } finally {
      setLoading(false)
    }
  }, [weekRange.from, weekRange.to])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Build weekDays array matching calendar positions (Mon-Sun)
  const weekDays = useMemo(() => {
    const result: { day: string; date: number; month: number; status: string; checkIn?: string; checkOut?: string; isoDate: string }[] = []
    const monday = new Date(weekRange.from + 'T00:00:00')

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const isoDate = d.toISOString().slice(0, 10)
      const stat = stats.find(s => s.date === isoDate)
      const dayOfWeek = d.getDay() // 0=Sun, 6=Sat

      let status = 'DAY_OFF'
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Weekday — check if absent
        status = stat?.status || 'ABSENT'
      }

      result.push({
        day: daysOfWeek[i],
        date: d.getDate(),
        month: d.getMonth(),
        status,
        checkIn: stat?.checkInTime,
        checkOut: stat?.checkOutTime,
        isoDate,
      })
    }
    return result
  }, [weekRange.from, stats])

  return (
    <div className="p-4 space-y-4">
      {/* Page Title */}
      <h2 className="text-headline-lg font-bold text-on-surface">Thống kê</h2>

      {/* Week/Month Toggle */}
      <div className="flex bg-surface-container rounded-xl p-1">
        <button
          onClick={() => setActiveTab('week')}
          className={`flex-1 py-2.5 rounded-lg text-body-lg font-semibold transition-colors ${
            activeTab === 'week'
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant'
          }`}
        >
          Tuần
        </button>
        <button
          onClick={() => setActiveTab('month')}
          className={`flex-1 py-2.5 rounded-lg text-body-lg font-semibold transition-colors ${
            activeTab === 'month'
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant'
          }`}
        >
          Tháng
        </button>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl border border-outline-variant px-4 py-3">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="w-8 h-8 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
        </button>
        <span className="text-body-lg font-semibold text-on-surface">{weekRange.label}</span>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="w-8 h-8 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </button>
      </div>

      {/* Day Calendar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map((d, i) => (
            <span key={d} className={`text-xs font-medium ${i === 6 ? 'text-error' : 'text-on-surface-variant'}`}>
              {d}
            </span>
          ))}
          {weekDays.map((wd) => (
            <button
              key={wd.date}
              onClick={() => setSelectedDay(wd.date)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-body-md font-medium transition-colors ${
                  selectedDay === wd.date
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {wd.date}
              </div>
              <div className={`w-2 h-2 rounded-full ${getStatusClass(wd.status)}`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* Chi tiết tuần */}
      <div className="space-y-3">
        <h3 className="text-headline-sm font-bold text-on-surface">Chi tiết tuần</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : weekDays.filter(d => d.checkIn || d.status === 'ABSENT').length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">Không có dữ liệu</div>
        ) : (
          weekDays
            .filter(d => d.checkIn || d.status === 'ABSENT')
            .map((item, i) => (
              <div
                key={i}
                onClick={() => navigate(`/stats/day/${item.isoDate}`)}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex items-center justify-between cursor-pointer active:bg-surface-container transition-colors"
              >
                <div>
                  <p className="text-body-lg font-medium text-on-surface">
                    {item.day}, {item.date}/{item.month + 1}
                  </p>
                  <p className="text-body-md text-on-surface-variant">
                    {item.checkIn
                      ? `${item.checkIn.slice(11, 16)}${item.checkOut ? ' - ' + item.checkOut.slice(11, 16) : ''}`
                      : 'Chưa điểm danh'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
