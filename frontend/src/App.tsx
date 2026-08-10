import { useState, type FormEvent } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AppShell from './components/AppShell'
import AdminShell from './components/AdminShell'
import HomePage from './pages/HomePage'
import StatsPage from './pages/StatsPage'
import DayDetailPage from './pages/DayDetailPage'
import ProfilePage from './pages/ProfilePage'
import LogoutPage from './pages/LogoutPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import EmployeeListPage from './pages/admin/EmployeeListPage'
import EmployeeDetailPage from './pages/admin/EmployeeDetailPage'
import ShiftManagementPage from './pages/admin/ShiftManagementPage'
import KioskAttendancePage from './pages/KioskAttendancePage'
import { login as apiLogin } from './services/auth'

// ─── Route Guard ────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-md text-on-surface-variant">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// ─── Login Page ─────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginSuccess, isAuthenticated } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)
    try {
      const data = await apiLogin(username.trim(), password)
      loginSuccess(data.accessToken)

      // Decode role from JWT to redirect correctly
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
        const target = (location.state as { from?: { pathname: string } })?.from?.pathname
          || (payload.role === 'ADMIN' ? '/admin' : '/')
        navigate(target, { replace: true })
      } catch {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl p-6 space-y-4 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-3xl">qr_code_2</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">Chấm Công QR</h1>
          <p className="text-body-md text-on-surface-variant">Hệ thống quản lý chấm công nội bộ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center bg-surface-container rounded-lg px-3 py-2.5">
            <span className="material-symbols-outlined text-outline mr-2">person</span>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-transparent outline-none text-body-lg"
              autoFocus
            />
          </div>
          <div className="flex items-center bg-surface-container rounded-lg px-3 py-2.5">
            <span className="material-symbols-outlined text-outline mr-2">lock</span>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-body-lg"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error-container rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-error text-lg">error</span>
              <p className="text-body-md text-error">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-xl transition-colors ${
              loading
                ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                : 'bg-primary-container text-on-primary hover:opacity-90'
            }`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-body-sm text-on-surface-variant">
          Dùng admin/admin123 hoặc nv001/nv001pass
        </p>
      </div>
    </div>
  )
}

// ─── App Routes ─────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/stats/day/:date" element={<DayDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
        <Route element={<RequireAuth><AdminShell /></RequireAuth>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/shifts" element={<ShiftManagementPage />} />
          <Route path="/admin/employees" element={<EmployeeListPage />} />
          <Route path="/admin/employees/:id" element={<EmployeeDetailPage />} />
        </Route>
        {/* Kiosk: public, no auth */}
        <Route path="/kiosk/attendance" element={<KioskAttendancePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
