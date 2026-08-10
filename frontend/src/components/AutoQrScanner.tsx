import { useEffect, useMemo, useRef, useState } from 'react'

type AutoQrScannerProps = {
  onDetected?: (token: string) => void
  onError?: (err: string) => void
  debounceMs?: number
}

// Auto QR scanner using html5-qrcode library (assumes dependency installed)
// This component renders a camera view and automatically detects QR tokens.
export const AutoQrScanner: React.FC<AutoQrScannerProps> = ({ onDetected, onError, debounceMs = 800 }) => {
  const containerId = useMemo(() => 'qr-reader-' + Math.random().toString(36).slice(2, 7), [])
  const mounted = useRef(false)
  const [scanning, setScanning] = useState(false)
  const lastDetected = useRef<number>(0)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
  }, [])

  useEffect(() => {
    let html5Qrcode: any
    let cancel = false
    const start = async () => {
      try {
        // @ts-ignore - Html5Qrcode may not have typings in this TS setup
        const { Html5Qrcode } = await import('html5-qrcode')
        const qrRegionId = containerId
        html5Qrcode = new Html5Qrcode(qrRegionId)
        const cameras = await Html5Qrcode.getCameras()
        if (cancel) return
        if (cameras && cameras.length) {
          const config = { fps: 10, qrbox: { width: 250, height: 250 } }
          await html5Qrcode.start(cameras[0].id, config, (decodedToken: string) => {
            const now = Date.now()
            if (now - lastDetected.current < debounceMs) return
            lastDetected.current = now
            onDetected?.(decodedToken)
            // Optional: automatically call attendance after detection
          }).catch((err: any) => {
            onError?.(String(err))
          })
          setScanning(true)
        } else {
          onError?.('No camera found')
        }
      } catch (e: any) {
        onError?.(e?.message ?? 'Camera initialization failed')
      }
    }
    start()
    return () => {
      cancel = true
      try {
        html5Qrcode?.stop?.().catch?.(() => {})
      } catch {}
    }
  }, [containerId, debounceMs, onDetected, onError])

  // Provide an empty UI if camera permission is denied or not available
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div id={containerId} style={{ width: 320, height: 320, border: '2px solid #ddd', borderRadius: 8 }} />
      <div style={{ marginTop: 8, color: '#666' }}>{scanning ? 'Đang quét...' : 'Chuẩn bị quét'}</div>
    </div>
  )
}
