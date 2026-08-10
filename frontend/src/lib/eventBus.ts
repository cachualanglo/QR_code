/**
 * 📡 Event Bus — Global Pub-Sub cho ứng dụng
 * Sử dụng Mitt (~200 bytes) để tạo hệ thống sự kiện typesafe
 *
 * Usage:
 *   import { bus } from '@/lib/eventBus'
 *   bus.emit('attendance:checkin', { time: '08:15', location: 'HQ' })
 *   bus.on('attendance:checkin', (payload) => console.log(payload))
 */

import mitt from 'mitt'

// ─── Event Types ────────────────────────────────────────
export type AppEvents = {
  // Attendance events
  'attendance:checkin': { time: string }
  'attendance:checkout': { time: string }

  // Auth events
  'auth:login': { employeeId: string; name: string }
  'auth:logout': void

  // UI events
  'ui:show-toast': { message: string; type: 'success' | 'error' | 'warning' }
  'ui:navigate': { path: string }
}

// ─── Singleton Bus ──────────────────────────────────────
export const bus = mitt<AppEvents>()

// ─── React Hook ─────────────────────────────────────────
import { useEffect, useCallback } from 'react'

/**
 * Hook subscribes to an event and auto-cleans on unmount
 *
 * @example
 *   useBusOn('attendance:checkin', (data) => {
 *     refreshStats()
 *   })
 */
export function useBusOn<K extends keyof AppEvents>(
  event: K,
  handler: (payload: AppEvents[K]) => void
): void {
  useEffect(() => {
    bus.on(event, handler)
    return () => bus.off(event, handler)
  }, [event, handler])
}

/**
 * Hook returns a stable emit function (no re-renders)
 *
 * @example
 *   const emit = useBusEmit()
 *   emit('ui:show-toast', { message: 'Thành công!', type: 'success' })
 */
export function useBusEmit(): typeof bus.emit {
  return useCallback((type: any, event?: any) => bus.emit(type, event), [])
}
