import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QrData {
  token: string
  shiftId?: number
  shiftName?: string
  expiresIn: number
  expiresAt?: number
}

/** Refresh 2s trước khi QR hết hạn để tránh khoảng trống */
const REFRESH_BUFFER_MS = 2000

export default function KioskAttendancePage() {
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isNoActiveShift, setIsNoActiveShift] = useState(false)

  // Fetch current QR from backend (public endpoint, no auth)
  const fetchQr = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/qr/current')
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        if (body?.errorCode === 'NO_ACTIVE_SHIFT') {
          setIsNoActiveShift(true)
          setQrData(null)
          setError('')
          setLoading(false)
          return
        }
        throw new Error(body?.message || `HTTP ${res.status}`)
      }
      const data: QrData = await res.json()
      setQrData(data)
      setIsNoActiveShift(false)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Không thể tải QR')
      setQrData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchQr()
  }, [fetchQr])

  // Single countdown timer — refresh when approaching expiry
  useEffect(() => {
    if (!qrData?.expiresAt) return

    const tick = () => {
      const remainingMs = qrData.expiresAt! - Date.now()
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000))
      setCountdown(remainingSec)

      // Refresh sớm 2s trước khi hết hạn để tránh khoảng trống
      if (remainingMs <= REFRESH_BUFFER_MS) {
        fetchQr()
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [qrData?.expiresAt, fetchQr])

  const countdownPercent = qrData?.expiresAt
    ? Math.max(0, Math.min(100, (countdown / (qrData.expiresIn || 60)) * 100))
    : 0

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-container flex flex-col items-center justify-center p-6 select-none">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-white text-3xl">qr_code_2</span>
        </div>
        <h1 className="text-headline-lg font-bold text-white">
          {qrData?.shiftName || 'Chấm Công'}
        </h1>
        <p className="text-body-lg text-white/80 mt-1">
          Quét QR code để điểm danh
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
        {loading ? (
          <div className="w-[260px] h-[260px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isNoActiveShift ? (
          <div className="w-[260px] h-[260px] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[#f57c00] text-5xl">schedule</span>
            <p className="text-body-lg font-semibold text-on-surface text-center">Chưa có ca hoạt động</p>
            <p className="text-body-sm text-on-surface-variant text-center">Vui lòng liên hệ Admin để mở ca</p>
            <button
              onClick={fetchQr}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : error ? (
          <div className="w-[260px] h-[260px] flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-error text-4xl">error</span>
            <p className="text-body-md text-error text-center">{error}</p>
            <button
              onClick={fetchQr}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : qrData ? (
          <QRCodeSVG value={qrData.token} size={260} level="M" />
        ) : (
          <div className="w-[260px] h-[260px] flex items-center justify-center">
            <p className="text-on-surface-variant text-center">Không có ca hoạt động</p>
          </div>
        )}
      </div>

      {/* Countdown */}
      {qrData && !error && (
        <div className="flex flex-col items-center gap-3">
          {/* Timer circle */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdownPercent / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-title-lg font-bold text-white">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <p className="text-body-md text-white/70">
            QR tự đổi sau {countdown}s
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-body-sm text-white/50">
          Hệ thống chấm công tự động
        </p>
      </div>
    </div>
  )
}
