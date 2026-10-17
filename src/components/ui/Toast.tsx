'use client'

// Lightweight toast notification system — no external library.
// Usage:
//   import { useToast } from '@/components/ui/Toast'
//   const { toast } = useToast()
//   toast.success('Trainer saved!')
//   toast.error('Something went wrong.')
//   toast.warning('Consent not on file.')
//   toast.info('Draft saved.')

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

type Variant = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id:      string
  variant: Variant
  message: string
  exiting: boolean
}

interface ToastAPI {
  success: (msg: string) => void
  error:   (msg: string) => void
  warning: (msg: string) => void
  info:    (msg: string) => void
}

const ToastContext = createContext<ToastAPI | null>(null)

const CONFIG: Record<Variant, { borderColor: string; icon: string; iconColor: string }> = {
  success: { borderColor: '#22c55e', icon: '✓', iconColor: '#16a34a' },
  error:   { borderColor: '#ef4444', icon: '✕', iconColor: '#dc2626' },
  warning: { borderColor: '#eab308', icon: '⚠', iconColor: '#d97706' },
  info:    { borderColor: '#3b82f6', icon: 'ℹ', iconColor: '#2563eb' },
}

let _counter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    // Start slide-out animation
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true } : t)))
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timers.current.delete(id)
    }, 260)
  }, [])

  const addToast = useCallback((variant: Variant, message: string) => {
    const id = String(++_counter)
    setToasts(prev => {
      const next = [...prev, { id, variant, message, exiting: false }]
      // Max 4 visible — drop oldest when 5th arrives
      if (next.length > 4) {
        const [oldest, ...rest] = next as [ToastItem, ...ToastItem[]]
        const oldTimer = timers.current.get(oldest.id)
        if (oldTimer) { clearTimeout(oldTimer); timers.current.delete(oldest.id) }
        return rest
      }
      return next
    })
    const t = setTimeout(() => dismiss(id), 4000)
    timers.current.set(id, t)
  }, [dismiss])

  const api = useMemo<ToastAPI>(() => ({
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info:    (msg) => addToast('info', msg),
  }), [addToast])

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position:      'fixed',
          bottom:        24,
          right:         24,
          display:       'flex',
          flexDirection: 'column',
          gap:           8,
          zIndex:        9999,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => {
          const cfg = CONFIG[t.variant]
          return (
            <div
              key={t.id}
              role="status"
              style={{
                background:   '#ffffff',
                borderRadius: 10,
                boxShadow:    '0 4px 20px rgba(15,23,42,0.12)',
                borderLeft:   `4px solid ${cfg.borderColor}`,
                padding:      '12px 16px',
                display:      'flex',
                alignItems:   'flex-start',
                gap:          10,
                minWidth:     280,
                maxWidth:     380,
                pointerEvents: 'auto',
                animation:    `${t.exiting ? 'toast-out' : 'toast-in'} 0.25s ease forwards`,
              }}
            >
              {/* Variant icon */}
              <span
                aria-hidden="true"
                style={{
                  fontSize:   16,
                  color:      cfg.iconColor,
                  lineHeight: '1.2',
                  flexShrink: 0,
                  marginTop:  1,
                }}
              >
                {cfg.icon}
              </span>

              {/* Message */}
              <span
                style={{
                  flex:       1,
                  fontSize:   13,
                  color:      '#172554',
                  fontWeight: 500,
                  lineHeight: '1.4',
                }}
              >
                {t.message}
              </span>

              {/* Manual close */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background:  'none',
                  border:      'none',
                  cursor:      'pointer',
                  color:       '#94a3b8',
                  fontSize:    14,
                  lineHeight:  '1',
                  padding:     0,
                  flexShrink:  0,
                  marginTop:   1,
                }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes toast-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toast-out {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(110%); opacity: 0; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return { toast: ctx }
}
