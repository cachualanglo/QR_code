import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  if (isLogin) {
    return <Outlet />
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-4 py-3">
        <div className="flex items-center justify-between">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-on-surface text-xl">menu</span>
          </button>
          <h1 className="text-headline-md font-bold text-primary">Chấm Công QR</h1>
          <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-on-primary text-xl">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
