import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Chấm công', icon: 'photo_camera', activeIcon: 'photo_camera' },
  { path: '/stats', label: 'Thống kê', icon: 'bar_chart', activeIcon: 'bar_chart' },
  { path: '/profile', label: 'Cá nhân', icon: 'person', activeIcon: 'person' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant z-50">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-full transition-colors ${
                active ? 'bg-[#dcfce7] text-primary' : 'text-outline'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${active ? 'fill-primary' : ''}`}>
                {active ? tab.activeIcon : tab.icon}
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
