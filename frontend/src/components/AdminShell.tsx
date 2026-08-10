import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminBottomNav from './AdminBottomNav'

export default function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isEmployeeDetail = /^\/admin\/employees\/\d+$/.test(location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-4 py-3">
        <div className="flex items-center justify-between">
          {isEmployeeDetail ? (
            <button
              onClick={() => navigate('/admin/employees')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-on-surface text-xl">arrow_back</span>
            </button>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
            </div>
          )}
          <h1 className="text-headline-md font-bold text-primary">
            {isEmployeeDetail ? 'Chi tiết nhân viên' : 'Quản trị'}
          </h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Admin Bottom Navigation */}
      {!isEmployeeDetail && <AdminBottomNav />}
    </div>
  )
}
