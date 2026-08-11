import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardData, getLocation } from '@/services/admin'
import type { DashboardEmployee } from '@/lib/types'

// ─── Component ──────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<DashboardEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number; radiusMeters: number } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const dashboardData = await getDashboardData(today)
        setEmployees(dashboardData || [])

        try {
          const loc = await getLocation()
          if (loc) setLocation({ lat: loc.latitude, lng: loc.longitude, radiusMeters: loc.radiusMeters })
        } catch {
          // ignore location fetch errors on dashboard load
        }
      } catch {
        // Ignore errors on dashboard load
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalEmployees = employees.length
  const checkedInToday = employees.filter(e => ['ON_TIME', 'LATE', 'CHECKED_IN'].includes(e.status)).length
  const pendingToday = employees.filter(e => e.status === 'ABSENT').length

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Greeting */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Xin chào, Admin!</h2>
        <p className="text-sm text-on-surface-variant mt-1">Tổng quan điểm danh hôm nay</p>
      </section>

      {/* Summary Stats - Horizontal Scroll */}
      <section className="mb-6">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
          {/* Total Employees */}
          <div className="snap-start min-w-[140px] flex-shrink-0 bg-surface-container rounded-xl p-4 shadow-sm border-l-2 border-primary flex flex-col justify-between">
            <span className="material-symbols-outlined text-primary opacity-80">groups</span>
            <div className="mt-4">
              <span className="text-3xl font-bold text-primary block">{loading ? '—' : totalEmployees}</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Tổng nhân viên</span>
            </div>
          </div>
          {/* Checked In */}
          <div className="snap-start min-w-[140px] flex-shrink-0 bg-[#dcfce7] rounded-xl p-4 shadow-sm border-l-2 border-[#1a7c3e] flex flex-col justify-between">
            <span className="material-symbols-outlined text-[#1a7c3e] opacity-80">how_to_reg</span>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#1a7c3e] block">{loading ? '—' : checkedInToday}</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Đã điểm danh</span>
            </div>
          </div>
          {/* Pending */}
          <div className="snap-start min-w-[140px] flex-shrink-0 bg-[#fff8e1] rounded-xl p-4 shadow-sm border-l-2 border-[#7c5c00] flex flex-col justify-between">
            <span className="material-symbols-outlined text-[#7c5c00] opacity-80">pending_actions</span>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#7c5c00] block">{loading ? '—' : pendingToday}</span>
              <span className="text-xs text-on-surface-variant mt-1 block">Chưa điểm danh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-on-surface">Hành động nhanh</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.open('/kiosk/attendance', '_blank')}
            className="flex items-center w-full p-4 bg-primary rounded-xl shadow-sm active:scale-95 duration-100 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="material-symbols-outlined text-white">qr_code_2</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-xs font-semibold text-white block">Mở Kiosk</span>
              <span className="text-sm text-white/80 block mt-0.5">Màn hình QR chấm công</span>
            </div>
            <span className="material-symbols-outlined text-white/80">open_in_new</span>
          </button>
          <button
            onClick={() => navigate('/admin/shifts')}
            className="flex items-center w-full p-4 bg-surface-container-lowest rounded-xl shadow-sm active:scale-95 duration-100 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#e8eaf6] flex items-center justify-center mr-3 flex-shrink-0">
              <span className="material-symbols-outlined text-[#3949ab]">schedule</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-xs font-semibold text-on-surface block">Quản lý ca làm việc</span>
              <span className="text-sm text-on-surface-variant block mt-0.5">Thêm, sửa, xóa ca</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </button>
          <button
            onClick={() => navigate('/admin/employees')}
            className="flex items-center w-full p-4 bg-surface-container-lowest rounded-xl shadow-sm active:scale-95 duration-100 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center mr-3 flex-shrink-0">
              <span className="material-symbols-outlined text-primary">people</span>
            </div>
            <div className="flex-1 text-left">
              <span className="text-xs font-semibold text-on-surface block">Danh sách nhân viên</span>
              <span className="text-sm text-on-surface-variant block mt-0.5">Xem tất cả nhân viên</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Recent Check-ins */}
      <section>
        {location && (
          <div className="mb-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant text-sm">
            <strong>Địa điểm chấm công</strong>
            <div className="mt-1">
              Vĩ độ: {location.lat}, Kinh độ: {location.lng}, Phạm vi: {location.radiusMeters} m
            </div>
          </div>
        )}
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-lg font-semibold text-on-surface">Nhân viên gần đây</h3>
          <button
            onClick={() => navigate('/admin/employees')}
            className="text-xs font-medium text-primary hover:underline"
          >
            Xem tất cả
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {employees.length === 0 ? (
            <p className="text-center text-on-surface-variant py-4">Không có dữ liệu</p>
          ) : (
            employees.slice(0, 5).map((emp) => {
              const initials = emp.employeeCode.slice(-2).toUpperCase()
              const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                'ON_TIME': { bg: 'bg-[#dcfce7]', text: 'text-[#1a7c3e]', label: '✓ Đúng giờ' },
                'LATE': { bg: 'bg-[#fff8e1]', text: 'text-[#7c5c00]', label: '◐ Đi trễ' },
                'CHECKED_IN': { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', label: '◉ Đang làm' },
                'COMPLETED': { bg: 'bg-[#dcfce7]', text: 'text-[#1a7c3e]', label: '✓ Hoàn thành' },
                'ABSENT': { bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', label: '○ Vắng' },
                'MISSING_CHECKOUT': { bg: 'bg-surface-container', text: 'text-primary', label: '◑ Thiếu CO' },
              }
              const sc = statusColors[emp.status] || statusColors['ABSENT']
              return (
                <div
                  key={emp.employeeId}
                  onClick={() => navigate(`/admin/employees/${emp.employeeId}`)}
                  className="flex items-center p-4 bg-surface-container-lowest rounded-xl shadow-sm cursor-pointer active:bg-surface-container transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center text-xs font-semibold text-[#1a7c3e] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-on-surface">{emp.employeeCode}</p>
                    <p className="text-xs text-on-surface-variant">{emp.checkInTime ? `Check-in: ${emp.checkInTime}` : 'Chưa điểm danh'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full ${sc.bg} ${sc.text} text-xs font-medium whitespace-nowrap`}>
                    {sc.label}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
