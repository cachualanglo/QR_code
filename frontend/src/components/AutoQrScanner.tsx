import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

type AutoQrScannerProps = {
  onDetected?: (token: string) => void
  onError?: (err: string) => void
  debounceMs?: number
}

// Fixed camera size for consistent layout
const CAMERA_SIZE = 280

// Force video to fill container via injected style
function injectCameraStyles(containerId: string) {
  const styleId = `cam-style-${containerId}`
  if (document.getElementById(styleId)) return
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    #${containerId} { width: ${CAMERA_SIZE}px !important; height: ${CAMERA_SIZE}px !important; overflow: hidden; border-radius: 12px; }
    #${containerId} > div { width: 100% !important; height: 100% !important; }
    #${containerId} video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
    #${containerId} img[alt="Info icon"] { display: none !important; }
    #${containerId} span { display: none !important; }
  `
  document.head.appendChild(style)
}

export const AutoQrScanner: React.FC<AutoQrScannerProps> = ({ onDetected, onError, debounceMs = 800 }) => {
  const containerId = useMemo(() => 'qr-reader-' + Math.random().toString(36).slice(2, 7), [])
  const html5QrcodeRef = useRef<any>(null)
  const [scanning, setScanning] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [cameraIdx, setCameraIdx] = useState(0)
  const lastDetected = useRef<number>(0)

  const findBackCamera = useCallback((cams: { id: string; label: string }[]) => {
    const idx = cams.findIndex(c =>
      c.label.toLowerCase().includes('back') ||
      c.label.toLowerCase().includes('rear') ||
      c.label.toLowerCase().includes('environment') ||
      c.label.includes(' sau')
    )
    return idx >= 0 ? idx : 0
  }, [])

  const startScanner = useCallback(async (camId: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (html5QrcodeRef.current) {
        try { await html5QrcodeRef.current.stop() } catch {}
        try { html5QrcodeRef.current.clear() } catch {}
      }
      injectCameraStyles(containerId)
      const html5Qrcode = new Html5Qrcode(containerId)
      html5QrcodeRef.current = html5Qrcode
      const config = { fps: 10, qrbox: { width: 200, height: 200 } }
      // @ts-ignore
      await html5Qrcode.start(camId, config, (decodedToken: string) => {
        const now = Date.now()
        if (now - lastDetected.current < debounceMs) return
        lastDetected.current = now
        onDetected?.(decodedToken)
      }).catch((err: any) => onError?.(String(err)))
      // Re-inject after start to override library styles
      setTimeout(() => injectCameraStyles(containerId), 200)
      setScanning(true)
    } catch (e: any) {
      onError?.(e?.message ?? 'Camera initialization failed')
    }
  }, [containerId, debounceMs, onDetected, onError])

  useEffect(() => {
    let cancel = false
    const init = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const cams = await Html5Qrcode.getCameras()
        if (cancel) return
        if (cams?.length) {
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

  const handleSwitch = async () => {
    if (cameras.length <= 1) return
    const nextIdx = (cameraIdx + 1) % cameras.length
    setCameraIdx(nextIdx)
    await startScanner(cameras[nextIdx].id)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Fixed-size camera container */}
      <div id={containerId} style={{ width: CAMERA_SIZE, height: CAMERA_SIZE }} />
      {/* Controls */}
      <div className="flex items-center gap-2">
        {cameras.length > 1 && (
          <button
            onClick={handleSwitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary text-sm font-medium bg-white hover:bg-primary/5 active:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base">cameraswitch</span>
            Đổi camera
          </button>
        )}
      </div>
      <p className="text-xs text-on-surface-variant">
        {scanning ? 'Đang quét...' : 'Chuẩn bị quét'}
      </p>
    </div>
  )
}
