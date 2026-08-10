import { useState, useEffect } from 'react'
import { getAllShifts, createShift, updateShift, deleteShift } from '@/services/admin'
import type { ShiftResponse, ShiftRequest } from '@/lib/types'

const emptyForm: ShiftRequest = {
  name: '',
  startTime: '08:00:00',
  endTime: '12:00:00',
  checkinCutoff: '10:00:00',
  qrRotationSeconds: 60,
  isActive: true,
}

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState<ShiftResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ShiftRequest>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadShifts()
  }, [])

  async function loadShifts() {
    try {
      const data = await getAllShifts()
      setShifts(data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  function openEdit(shift: ShiftResponse) {
    setEditingId(shift.id)
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      checkinCutoff: shift.checkinCutoff,
      qrRotationSeconds: shift.qrRotationSeconds,
      isActive: shift.isActive,
    })
    setShowForm(true)
    setError('')
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Tên ca không được để trống')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await updateShift(editingId, form)
      } else {
        await createShift(form)
      }
      setShowForm(false)
      await loadShifts()
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu ca')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Xóa ca "${name}"?`)) return
    try {
      await deleteShift(id)
      await loadShifts()
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa ca')
    }
  }

  function formatTime(t: string) {
    // HH:mm:ss → HH:mm
    return t?.substring(0, 5) || t
  }

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-on-surface">Ca làm việc</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Thêm ca
        </button>
      </div>

      {/* Shift List */}
      {loading ? (
        <div className="text-center py-8 text-on-surface-variant">Đang tải...</div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant">Chưa có ca nào</div>
      ) : (
        <div className="flex flex-col gap-3">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-on-surface">{shift.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        shift.isActive
                          ? 'bg-[#dcfce7] text-[#1a7c3e]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {shift.isActive ? 'Đang hoạt động' : 'Tạm tắt'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {formatTime(shift.startTime)} — {formatTime(shift.endTime)}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Cutoff: {formatTime(shift.checkinCutoff)} · QR xoay: {shift.qrRotationSeconds}s
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(shift)}
                    className="p-2 rounded-full hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-outline">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(shift.id, shift.name)}
                    className="p-2 rounded-full hover:bg-error-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-error">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-surface-container-lowest w-full max-w-[430px] rounded-t-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">
                {editingId ? 'Sửa ca' : 'Thêm ca mới'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1">
                <span className="material-symbols-outlined text-outline">close</span>
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-on-surface-variant block mb-1">Tên ca</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Ca sáng"
                className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none"
              />
            </div>

            {/* Start / End */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={form.startTime.substring(0, 5)}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value + ':00' })}
                  className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Giờ kết thúc</label>
                <input
                  type="time"
                  value={form.endTime.substring(0, 5)}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value + ':00' })}
                  className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none"
                />
              </div>
            </div>

            {/* Cutoff / QR Rotation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">Cutoff check-in</label>
                <input
                  type="time"
                  value={form.checkinCutoff.substring(0, 5)}
                  onChange={(e) => setForm({ ...form, checkinCutoff: e.target.value + ':00' })}
                  className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant block mb-1">QR xoay (giây)</label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={form.qrRotationSeconds}
                  onChange={(e) => setForm({ ...form, qrRotationSeconds: Number(e.target.value) })}
                  className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-body-lg outline-none"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface-variant">Kích hoạt</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form.isActive ? 'bg-primary' : 'bg-outline-variant'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                    form.isActive ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo ca'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
