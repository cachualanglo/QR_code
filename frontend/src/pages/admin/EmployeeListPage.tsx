import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllEmployees, getEmployeeStats } from '@/services/admin'
import type { DayStatsResponse } from '@/lib/types'

// ─── Types ──────────────────────────────────────────────
type EmployeeStatus = 'on-time' | 'late' | 'absent' | 'missing-checkout'

interface EmployeeWithStatus {
  id: number
  name: string
  code: string
  status: EmployeeStatus
  checkInTime?: string
}

// ─── Status Config ──────────────────────────────────────
const statusConfig: Record<EmployeeStatus, { label: string; bg: string; text: string }> = {
  'on-time':          { label: '✓ Đúng giờ',    bg: 'bg-[#dcfce7]', text: 'text-[#1a7c3e]' },
  'late':             { label: '◐ Đi trễ',      bg: 'bg-[#fff8e1]', text: 'text-[#7c5c00]' },
  'absent':           { label: '○ Vắng',        bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
  'missing-checkout': { label: '◑ Thiếu CO',    bg: 'bg-surface-container', text: 'text-primary' },
}

type FilterTab = 'all' | 'checked-in' | 'pending'

// ─── Component ──────────────────────────────────────────
export default function EmployeeListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialFilter = (searchParams.get('filter') as FilterTab) || 'all'

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>(initialFilter)
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch employees + today's stats
  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().slice(0, 10)
        const [empList] = await Promise.all([
          getAllEmployees(),
          getEmployeeStats(0, today, today).catch(() => [] as DayStatsResponse[]),
        ])

        // Map employees with status
        const mapped: EmployeeWithStatus[] = (empList || []).map(emp => {
          let status: EmployeeStatus = 'absent'
          let checkInTime: string | undefined

          // For now, show all as absent until we have per-employee stats
          return {
            id: emp.id,
            name: emp.employeeCode,
            code: emp.employeeCode,
            status,
            checkInTime,
          }
        })
        setEmployees(mapped)
      } catch {
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredEmployees = useMemo(() => employees.filter((emp) => {
    const matchSearch = !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.code.toLowerCase().includes(search.toLowerCase())
    if (activeFilter === 'checked-in') return matchSearch && emp.status !== 'absent'
    if (activeFilter === 'pending') return matchSearch && emp.status === 'absent'
    return matchSearch
  }), [employees, search, activeFilter])

  const checkedInCount = employees.filter(e => e.status !== 'absent').length
  const pendingCount = employees.filter(e => e.status === 'absent').length

  const getInitials = (code: string) => {
    return code.slice(-2).toUpperCase()
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Search Bar */}
      <div className="px-4 mt-4">
        <div className="relative flex items-center w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <span className="material-symbols-outlined text-outline ml-3 mr-1" style={{ fontSize: 20 }}>search</span>
          <input
            type="text"
            placeholder="Tìm nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none text-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mt-3">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {([
            { key: 'all', label: `Tất cả (${employees.length})` },
            { key: 'checked-in', label: `Đã điểm danh (${checkedInCount})` },
            { key: 'pending', label: `Chưa điểm danh (${pendingCount})` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-none px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap active:scale-95 transition-transform ${
                activeFilter === tab.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List */}
      <div className="px-4 mt-3 mb-8">
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-outline-variant text-6xl mb-3">search_off</span>
              <p className="text-lg font-semibold text-on-surface">Không tìm thấy</p>
              <p className="text-sm text-on-surface-variant">Không có nhân viên phù hợp</p>
            </div>
          ) : (
            filteredEmployees.map((emp, idx) => {
              const cfg = statusConfig[emp.status]
              return (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/admin/employees/${emp.id}`)}
                  className={`p-4 flex items-center justify-between active:bg-surface-container-low transition-colors cursor-pointer ${
                    idx < filteredEmployees.length - 1 ? 'border-b border-surface-container-high' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {getInitials(emp.code)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-on-surface">{emp.code}</span>
                      <span className="text-xs text-on-surface-variant">{emp.checkInTime ? `Check-in: ${emp.checkInTime}` : 'Chưa điểm danh'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full ${cfg.bg} ${cfg.text} text-xs font-medium whitespace-nowrap`}>
                      {cfg.label}
                    </span>
                    {emp.checkInTime && (
                      <span className="text-xs text-on-surface-variant font-medium">{emp.checkInTime}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
