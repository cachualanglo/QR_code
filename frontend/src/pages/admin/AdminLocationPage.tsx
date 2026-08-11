import { useState, useEffect } from 'react'
import { getLocation, updateLocation } from '@/services/admin'
import type { CompanyLocationResponse } from '@/lib/types'

export default function AdminLocationPage() {
  const [location, setLocation] = useState<CompanyLocationResponse | null>(null)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [radius, setRadius] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  useEffect(() => {
    async function fetchLocation() {
      try {
        const data = await getLocation()
        setLocation(data)
        setLat(String(data.latitude))
        setLng(String(data.longitude))
        setRadius(String(data.radiusMeters))
      } catch {
        // Default values if fetch fails
        setLat('10.7769')
        setLng('106.7009')
        setRadius('500')
      } finally {
        setLoading(false)
      }
    }
    fetchLocation()
  }, [])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Trình duyệt không hỗ trợ GPS' })
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)))
        setLng(String(pos.coords.longitude.toFixed(6)))
        setGpsLoading(false)
        setMessage({ type: 'success', text: 'Đã lấy toạ độ hiện tại' })
      },
      () => {
        setGpsLoading(false)
        setMessage({ type: 'error', text: 'Không thể lấy vị trí GPS' })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSave = async () => {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    const radiusNum = parseFloat(radius)

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số hợp lệ' })
      return
    }
    if (latNum < -90 || latNum > 90) {
      setMessage({ type: 'error', text: 'Vĩ độ phải từ -90 đến 90' })
      return
    }
    if (lngNum < -180 || lngNum > 180) {
      setMessage({ type: 'error', text: 'Kinh độ phải từ -180 đến 180' })
      return
    }
    if (radiusNum <= 0 || radiusNum > 10000) {
      setMessage({ type: 'error', text: 'Bán kính phải từ 1 đến 10,000 mét' })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      await updateLocation({ latitude: latNum, longitude: lngNum, radiusMeters: radiusNum })
      setLocation({ latitude: latNum, longitude: lngNum, radiusMeters: radiusNum })
      setMessage({ type: 'success', text: 'Cập nhật vị trí công ty thành công!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thất bại' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-xl font-bold text-on-surface">Vị trí công ty</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Quản lý toạ độ GPS và bán kính geofence cho hệ thống chấm công
        </p>
      </section>

      {/* Current Location Card */}
      {location && (
        <div className="bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            <span className="text-sm font-semibold text-on-surface">Vị trí hiện tại</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-on-surface-variant">Vĩ độ</p>
              <p className="font-mono font-medium text-on-surface">{location.latitude}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">Kinh độ</p>
              <p className="font-mono font-medium text-on-surface">{location.longitude}</p>
            </div>
            <div>
              <p className="text-on-surface-variant">Bán kính</p>
              <p className="font-mono font-medium text-on-surface">{location.radiusMeters}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-lg">edit_location</span>
          <span className="text-sm font-semibold text-on-surface">Cập nhật vị trí</span>
        </div>

        {/* Latitude */}
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Vĩ độ (Latitude)</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="10.7769"
            className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Kinh độ (Longitude)</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="106.7009"
            className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1">Bán kính geofence (mét)</label>
          <input
            type="number"
            step="1"
            min="1"
            max="10000"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            placeholder="500"
            className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Nhân viên phải trong bán kính này để được tính là điểm danh hợp lệ
          </p>
        </div>

        {/* GPS Auto-detect Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={gpsLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-primary hover:bg-primary-container/10 transition-colors disabled:opacity-50"
        >
          {gpsLoading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg">my_location</span>
          )}
          {gpsLoading ? 'Đang lấy GPS...' : 'Dùng toạ độ hiện tại'}
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 font-semibold rounded-xl transition-colors ${
            saving
              ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              : 'bg-primary-container text-on-primary hover:opacity-90'
          }`}
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>

        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-error-container text-error'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Cách hoạt động của geofence</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Khi quét QR, hệ thống tự động lấy GPS từ thiết bị</li>
              <li>Khoảng cách tính bằng công thức Haversine (đơn vị: mét)</li>
              <li>Vượt quá bán kính → báo lỗi <code className="bg-blue-100 px-1 rounded">GEO_OUT_OF_RANGE</code></li>
              <li>Toạ độ và bán kính chỉ admin mới được phép thay đổi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
