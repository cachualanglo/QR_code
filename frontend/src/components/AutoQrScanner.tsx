import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

type AutoQrScannerProps = {
  onDetected?: (token: string) => void
  onError?: (err: string) => void
  debounceMs?: number
}

// Auto QR scanner using html5-qrcode library.
// This component renders a camera view and automatically detects QR tokens.
// Prefers back camera by default, with a button to switch cameras.
export const AutoQrScanner: React.FC<AutoQrScannerProps> = ({ onDetected, onError, debounceMs = 800 }) => {
  const containerId = useMemo(() => 'qr-reader-' + Math.random().toString(36).slice(2, 7), [])
  const html5QrcodeRef = useRef<any>(null)
  const [scanning, setScanning] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [cameraIdx, setCameraIdx] = useState(0)
  const lastDetected = useRef<number>(0)

  // Find back camera index
  const findBackCamera = useCallback((cams: { id: string; label: string }[]) => {
    const backIdx = cams.findIndex(c =>
      c.label.toLowerCase().includes('back') ||
      c.label.toLowerCase().includes('rear') ||
      c.label.toLowerCase().includes('environment') ||
      c.label.includes(' sau')
    )
    return backIdx >= 0 ? backIdx : 0
  }, [])

  // Start scanner with specific camera
  const startScanner = useCallback(async (camId: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (html5QrcodeRef.current) {
        try { await html5QrcodeRef.current.stop() } catch {}
        try { html5QrcodeRef.current.clear() } catch {}
      }
      const html5Qrcode = new Html5Qrcode(containerId)
      html5QrcodeRef.current = html5Qrcode
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      await html5Qrcode.start(camId, config, (decodedToken: string) => {
        const now = Date.now()
        if (now - lastDetected.current < debounceMs) return
        lastDetected.current = now
        onDetected?.(decodedToken)
      }).catch((err: any) => {
        onError?.(String(err))
      })
      setScanning(true)
    } catch (e: any) {
      onError?.(e?.message ?? 'Camera initialization failed')
    }
  }, [containerId, debounceMs, onDetected, onError])

  // Initial start — prefer back camera
  useEffect(() => {
    let cancel = false
    const init = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const cams = await Html5Qrcode.getCameras()
        if (cancel) return
        if (cams && cams.length) {
          setCameras(cams)
          const backIdx = findBackCamera(cams)
          setCameraIdx(backIdx)
          await startScanner(cams[backIdx].id)
        } else {
          onError?.('No camera found')
        }
      } catch (e: any) {
        onError?.(e?.message ?? 'Camera initialization failed')
      }
    }
    init()
    return () => {
      cancel = true
      try { html5QrcodeRef.current?.stop?.().catch?.(() => {}) } catch {}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Switch camera
  const handleSwitch = async () => {
    if (cameras.length <= 1) return
    const nextIdx = (cameraIdx + 1) % cameras.length
    setCameraIdx(nextIdx)
    await startScanner(cameras[nextIdx].id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div id={containerId} style={{ width: 300, height: 300, border: '2px solid #ddd', borderRadius: 8 }} />
      {cameras.length > 1 && (
        <button
          onClick={handleSwitch}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #003d9b', background: '#fff',
            color: '#003d9b', fontSize: 14, cursor: 'pointer'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cameraswitch</span>
          Đổi camera
        </button>
      )}
      <div style={{ color: '#666', fontSize: 13 }}>{scanning ? 'Đang quét...' : 'Chuẩn bị quét'}</div>
    </div>
  )
}
