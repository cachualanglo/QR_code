import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { path: '/admin/shifts', label: 'Ca làm việc', icon: 'schedule', exact: true },
  { path: '/admin/employees', label: 'Nhân viên', icon: 'people', exact: false },
]

export default function AdminBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) return location.pathname === tab.path
    return location.pathname.startsWith(tab.path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant z-50">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-full transition-colors ${
                active ? 'bg-[#dcfce7] text-primary' : 'text-outline'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${active ? 'fill-primary' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
