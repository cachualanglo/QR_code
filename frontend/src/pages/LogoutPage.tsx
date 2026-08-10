import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LogoutPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleCancel = () => {
    navigate('/profile')
  }

  const handleConfirm = async () => {
    await logout()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop — covers header + bottom nav */}
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel}></div>

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl mx-6 w-full max-w-sm p-8 space-y-4 text-center">
        {/* Logout Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-4xl">logout</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-headline-lg font-bold text-on-surface">Đăng xuất</h2>

        {/* Description */}
        <p className="text-body-lg text-on-surface-variant">
          Bạn có chắc muốn đăng xuất khỏi hệ thống?
        </p>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-outline-variant text-on-surface font-semibold text-body-lg transition-colors hover:bg-surface-container"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-error text-on-error font-semibold text-body-lg transition-colors hover:bg-error/90"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  )
}
