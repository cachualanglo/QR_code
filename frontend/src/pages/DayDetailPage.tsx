import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { splitSeconds, formatDuration } from '@/lib/utils'
import { getDayDetail } from '@/services/attendance'
import type { DayDetailResponse } from '@/lib/types'

// ─── Status helpers ─────────────────────────────────────
function getStatusFromTimes(checkIn?: string, checkOut?: string) {
  if (!checkIn) return { label: 'Vắng mặt', bg: 'bg-error-container', text: 'text-error', icon: 'cancel' }
  if (!checkOut) return { label: 'Thiếu Check-out', bg: 'bg-[#fff3e0]', text: 'text-[#f57c00]', icon: 'warning' }
  // Default — backend determines on-time vs late
  return { label: 'ĐÃ CHẤM CÔNG', bg: 'bg-success-container', text: 'text-success', icon: 'verified' }
}

// ─── Component ──────────────────────────────────────────
export default function DayDetailPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<DayDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    getDayDetail(date)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [date])

  // Parse times for display
  const checkIn = useMemo(() => {
    if (!detail?.checkInTime) return null
    // Extract time portion from ISO string
    const timePart = detail.checkInTime.includes('T') ? detail.checkInTime.split('T')[1] : detail.checkInTime
    return splitSeconds(timePart)
  }, [detail?.checkInTime])

  const checkOut = useMemo(() => {
    if (!detail?.checkOutTime) return null
    const timePart = detail.checkOutTime.includes('T') ? detail.checkOutTime.split('T')[1] : detail.checkOutTime
    return splitSeconds(timePart)
  }, [detail?.checkOutTime])

  const duration = useMemo(() => {
    if (!detail?.checkInTime || !detail?.checkOutTime) return null
    const inMs = new Date(detail.checkInTime).getTime()
    const outMs = new Date(detail.checkOutTime).getTime()
    return formatDuration(outMs - inMs)
  }, [detail?.checkInTime, detail?.checkOutTime])

  const status = useMemo(() => getStatusFromTimes(detail?.checkInTime, detail?.checkOutTime), [detail])

  // Format date for display
  const displayDate = useMemo(() => {
    if (!date) return ''
    const parts = date.split('-')
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }, [date])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/stats')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-on-surface text-xl">arrow_back</span>
          </button>
          <h1 className="text-headline-md font-bold text-primary">Chi tiết</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/stats')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-on-surface text-xl">arrow_back</span>
        </button>
        <h1 className="text-headline-md font-bold text-primary">Chi tiết {displayDate}</h1>
      </div>

      {/* Status Badge */}
      <div className="flex flex-col items-center gap-1">
        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${status.bg}`}>
          <span className={`material-symbols-outlined ${status.text} text-lg`}>{status.icon}</span>
          <span className={`text-body-lg font-bold ${status.text}`}>{status.label}</span>
        </div>
        <p className="text-body-md text-on-surface-variant">{displayDate}</p>
      </div>

      {/* No data */}
      {!detail?.checkInTime && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-outline-variant text-5xl mb-3">event_busy</span>
          <p className="text-body-lg text-on-surface-variant">Không có dữ liệu điểm danh cho ngày này</p>
        </div>
      )}

      {/* Check-in Card */}
      {checkIn && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant border-l-4 border-l-success p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-success">login</span>
              <span className="text-headline-sm font-bold text-on-surface">Giờ vào</span>
            </div>
            <div className="text-right">
              <span className="text-headline-lg font-bold text-primary">{checkIn.time}</span>
              <span className="text-body-sm text-on-surface-variant align-top">{checkIn.seconds}</span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-lg mt-0.5">location_on</span>
              <div>
                <p className="text-body-sm text-on-surface-variant">Vị trí:</p>
                <p className="text-body-md text-on-surface">
                  {detail?.checkInLat?.toFixed(4) || '—'}, {detail?.checkInLng?.toFixed(4) || '—'}
                </p>
              </div>
            </div>
            {detail?.checkInDistanceM != null && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">distance</span>
                <span className="text-body-md text-on-surface">Khoảng cách:</span>
                <span className="text-body-md font-semibold text-on-surface">{detail.checkInDistanceM.toFixed(1)}m</span>
              </div>
            )}
            {detail?.checkInAccuracy != null && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">gps_fixed</span>
                <span className="text-body-md text-on-surface">Độ chính xác:</span>
                <span className="text-body-md text-on-surface">±{detail.checkInAccuracy.toFixed(1)}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check-out Card */}
      {checkOut && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant border-l-4 border-l-success p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-success">logout</span>
              <span className="text-headline-sm font-bold text-on-surface">Giờ ra</span>
            </div>
            <div className="text-right">
              <span className="text-headline-lg font-bold text-primary">{checkOut.time}</span>
              <span className="text-body-sm text-on-surface-variant align-top">{checkOut.seconds}</span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-lg mt-0.5">location_on</span>
              <div>
                <p className="text-body-sm text-on-surface-variant">Vị trí:</p>
                <p className="text-body-md text-on-surface">
                  {detail?.checkOutLat?.toFixed(4) || '—'}, {detail?.checkOutLng?.toFixed(4) || '—'}
                </p>
              </div>
            </div>
            {detail?.checkOutDistanceM != null && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">distance</span>
                <span className="text-body-md text-on-surface">Khoảng cách:</span>
                <span className="text-body-md font-semibold text-on-surface">{detail.checkOutDistanceM.toFixed(1)}m</span>
              </div>
            )}
            {detail?.checkOutAccuracy != null && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">gps_fixed</span>
                <span className="text-body-md text-on-surface">Độ chính xác:</span>
                <span className="text-body-md text-on-surface">±{detail.checkOutAccuracy.toFixed(1)}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tổng kết ngày */}
      {duration && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 space-y-3">
          <h3 className="text-headline-sm font-bold text-on-surface">Tổng kết</h3>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <div>
              <p className="text-body-sm text-on-surface-variant">Tổng thời gian làm việc</p>
              <p className="text-headline-sm font-bold text-primary">{duration}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
