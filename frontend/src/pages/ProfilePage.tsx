import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const profileFields = [
    { icon: 'badge', label: 'Mã nhân viên', value: user?.employeeCode || '-' },
    { icon: 'person', label: 'Tên đăng nhập', value: user?.username || '-' },
    { icon: 'admin_panel_settings', label: 'Vai trò', value: user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên' },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="p-4 space-y-4">
      {/* Profile Avatar & Name */}
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-5xl">person</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-body-lg font-semibold text-primary">{user?.employeeCode || '-'}</p>
          <h2 className="text-headline-lg font-bold text-on-surface">{user?.username || '-'}</h2>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant divide-y divide-outline-variant">
        {profileFields.map((field) => (
          <div key={field.label} className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">{field.icon}</span>
              <span className="text-body-lg text-on-surface-variant">{field.label}</span>
            </div>
            <span className="text-body-lg font-medium text-on-surface">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-xl bg-error-container text-error font-semibold text-body-lg flex items-center justify-center gap-2 transition-colors hover:bg-error/10"
      >
        <span className="material-symbols-outlined text-xl">logout</span>
        Đăng xuất
      </button>
    </div>
  )
}
