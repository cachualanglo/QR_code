import { useState, useEffect, useCallback } from 'react'
import { getGreeting } from '@/lib/utils'
import { useBusEmit } from '@/lib/eventBus'
import { useAuth } from '@/contexts/AuthContext'
import { scanQr, getDayStats } from '@/services/attendance'
import { ApiError } from '@/lib/api'
import { AutoQrScanner } from '@/components/AutoQrScanner'
import type { AttendanceResponse, DayStatsResponse } from '@/lib/types'

type ScanStatus = 'LOADING' | 'READY' | 'SCANNING' | 'SUCCESS' | 'ALREADY_DONE' | 'ERROR'

export default function HomePage() {
  const { user } = useAuth()
  const now = new Date()
  const emit = useBusEmit()

  const [scanStatus, setScanStatus] = useState<ScanStatus>('LOADING')
  const [todayRecord, setTodayRecord] = useState<DayStatsResponse | null>(null)
  const [result, setResult] = useState<AttendanceResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Fetch today's attendance status
  const fetchTodayStatus = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const data = await getDayStats(today, today)
      if (data && data.length > 0) {
        setTodayRecord(data[0])
        if (data[0].checkInTime && data[0].checkOutTime) {
          setScanStatus('ALREADY_DONE')
        } else {
          setScanStatus('READY')
        }
      } else {
        setTodayRecord(null)
        setScanStatus('READY')
      }
    } catch {
      setScanStatus('READY')
    }
  }, [])

  useEffect(() => {
    fetchTodayStatus()
  }, [fetchTodayStatus])

  // Handle QR detected
  const handleDetected = async (token: string) => {
    setScanStatus('SCANNING')
    setErrorMsg('')
    try {
      const res = await scanQr(token)
      setResult(res)
      setScanStatus('SUCCESS')

      if (res.action === 'CHECK_IN') {
        emit('attendance:checkin', { time: res.checkInAt ?? new Date().toLocaleTimeString('vi-VN') })
        emit('ui:show-toast', { message: res.message ?? 'Check-in thành công!', type: 'success' })
      } else {
        emit('attendance:checkout', { time: res.checkOutAt ?? new Date().toLocaleTimeString('vi-VN') })
        emit('ui:show-toast', { message: res.message ?? 'Check-out thành công!', type: 'success' })
      }

      // Refresh today's status
      fetchTodayStatus()
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : (err.message || 'Lỗi không xác định')
      setErrorMsg(msg)
      setScanStatus('ERROR')
      emit('ui:show-toast', { message: msg, type: 'error' })
    }
  }

  // Reset to ready for re-scan
  const handleReset = () => {
    setResult(null)
    setErrorMsg('')
    if (todayRecord?.checkInTime && todayRecord?.checkOutTime) {
      setScanStatus('ALREADY_DONE')
    } else {
      setScanStatus('READY')
    }
  }

  const checkedIn = !!todayRecord?.checkInTime
  const checkedOut = !!todayRecord?.checkOutTime

  return (
    <div className="p-4 space-y-4">
      {/* Welcome */}
      <div className="space-y-1">
        <h2 className="text-headline-lg font-bold text-on-surface">{getGreeting(now.getHours())}</h2>
        <p className="text-headline-md font-semibold text-primary">{user?.username || 'NV'}!</p>
      </div>

      {/* Today Status */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4">
        <p className="text-body-sm text-on-surface-variant mb-2">Hôm nay</p>
        <div className="flex items-center gap-3">
          {/* Check-in */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`material-symbols-outlined text-lg ${checkedIn ? 'text-success' : 'text-outline-variant'}`}>
                {checkedIn ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="text-body-sm font-medium text-on-surface">Check-in</span>
            </div>
            <p className={`text-body-md font-semibold pl-6 ${checkedIn ? 'text-on-surface' : 'text-outline-variant'}`}>
              {todayRecord?.checkInTime || '--:--'}
            </p>
          </div>
          <div className="w-px h-8 bg-outline-variant" />
          {/* Check-out */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`material-symbols-outlined text-lg ${checkedOut ? 'text-success' : 'text-outline-variant'}`}>
                {checkedOut ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="text-body-sm font-medium text-on-surface">Check-out</span>
            </div>
            <p className={`text-body-md font-semibold pl-6 ${checkedOut ? 'text-on-surface' : 'text-outline-variant'}`}>
              {todayRecord?.checkOutTime || '--:--'}
            </p>
          </div>
        </div>
        {todayRecord?.status && todayRecord.status !== 'ABSENT' && (
          <div className="mt-2 pt-2 border-t border-outline-variant">
            <span className={`text-body-sm font-medium ${
              todayRecord.status === 'LATE' ? 'text-error' :
              todayRecord.status === 'MISSING_CHECKOUT' ? 'text-[#f57c00]' :
              'text-success'
            }`}>
              {todayRecord.status === 'ON_TIME' && '✓ Đi đúng giờ'}
              {todayRecord.status === 'LATE' && '⚠ Đi muộn'}
              {todayRecord.status === 'DAY_OFF' && '📅 Ngày nghỉ'}
              {todayRecord.status === 'MISSING_CHECKOUT' && '⚠ Chưa check-out'}
            </span>
          </div>
        )}
      </div>

      {/* Scan Card */}
      {scanStatus !== 'ALREADY_DONE' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 px-5 py-4 text-center border-b border-outline-variant">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-xl">qr_code_scanner</span>
              <p className="text-headline-sm font-bold text-on-surface">
                {checkedIn && !checkedOut ? 'Check-out' : 'Chấm công'}
              </p>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {checkedIn && !checkedOut
                ? 'Quét QR trên Kiosk để check-out'
                : 'Quét QR trên Kiosk để điểm danh'}
            </p>
          </div>
          {/* Scanner */}
          <div className="p-4">
            <div className="relative mx-auto" style={{ maxWidth: 340 }}>
              <AutoQrScanner onDetected={handleDetected} onError={(e) => { setScanStatus('ERROR'); setErrorMsg(e) }} />
            </div>
          </div>
        </div>
      )}

      {/* Already Done */}
      {scanStatus === 'ALREADY_DONE' && (
        <div className="bg-[#e8f5e9] rounded-2xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-[#2e7d32] text-5xl">task_alt</span>
          <p className="text-headline-sm font-bold text-on-surface">Đã hoàn tất chấm công</p>
          <p className="text-body-md text-on-surface-variant">Hôm nay bạn đã check-in và check-out đầy đủ</p>
        </div>
      )}

      {/* Success Result */}
      {scanStatus === 'SUCCESS' && result && (
        <div className="bg-success-container rounded-2xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-success text-5xl">check_circle</span>
          <p className="text-headline-sm font-bold text-on-surface">
            {result.action === 'CHECK_IN' ? 'Check-in thành công!' : 'Check-out thành công!'}
          </p>
          <p className="text-body-lg text-on-surface-variant">
            {result.action === 'CHECK_IN' ? result.checkInAt : result.checkOutAt}
          </p>
          {result.lateMinutes != null && result.lateMinutes > 0 && (
            <p className="text-body-md text-error font-medium">Đi muộn {result.lateMinutes} phút</p>
          )}
          {result.earlyLeaveMinutes != null && result.earlyLeaveMinutes > 0 && (
            <p className="text-body-md text-[#f57c00] font-medium">Về sớm {result.earlyLeaveMinutes} phút</p>
          )}
          {result.message && (
            <p className="text-body-md text-on-surface-variant">{result.message}</p>
          )}
          <button onClick={handleReset} className="mt-2 px-6 py-2.5 bg-white text-primary font-semibold rounded-xl active:scale-95 transition-transform">
            Quét lại
          </button>
        </div>
      )}

      {/* Error */}
      {scanStatus === 'ERROR' && (
        <div className="bg-error-container rounded-2xl p-6 text-center space-y-3">
          <span className="material-symbols-outlined text-error text-5xl">error</span>
          <p className="text-headline-sm font-bold text-on-surface">Chấm công thất bại</p>
          <p className="text-body-md text-on-surface-variant">{errorMsg}</p>
          <button onClick={handleReset} className="mt-2 px-6 py-2.5 bg-white text-error font-semibold rounded-xl active:scale-95 transition-transform">
            Thử lại
          </button>
        </div>
      )}
    </div>
  )
}
