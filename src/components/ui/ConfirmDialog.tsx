'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

interface ConfirmOptions {
  title?:         string
  confirmLabel?:  string
  cancelLabel?:   string
  variant?:       'default' | 'danger'
}

type ResolveFn = (value: boolean) => void

interface DialogState {
  open:    boolean
  message: string
  options: Required<ConfirmOptions>
}

interface ConfirmContextValue {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

const DEFAULTS: Required<ConfirmOptions> = {
  title:        'Confirm',
  confirmLabel: 'OK',
  cancelLabel:  'Cancel',
  variant:      'default',
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, message: '', options: DEFAULTS })
  const resolveRef = useRef<ResolveFn | null>(null)

  const confirm = useCallback((message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve
      setState({ open: true, message, options: { ...DEFAULTS, ...options } })
    })
  }, [])

  function respond(value: boolean) {
    setState(s => ({ ...s, open: false }))
    resolveRef.current?.(value)
    resolveRef.current = null
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') respond(false)
    if (e.key === 'Enter')  respond(true)
  }

  const isDanger = state.options.variant === 'danger'

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-msg"
          onKeyDown={onKeyDown}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            animation: 'confirmBackdropIn 0.15s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) respond(false) }}
        >
          <style>{`
            @keyframes confirmBackdropIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes confirmCardIn {
              from { opacity: 0; transform: scale(0.94) translateY(-8px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              width: '100%',
              maxWidth: 420,
              margin: '0 16px',
              animation: 'confirmCardIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isDanger && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(220,38,38,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                )}
                <h2 id="confirm-title" style={{ fontSize: 17, fontWeight: 700, color: '#172554', margin: 0 }}>
                  {state.options.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '12px 24px 24px' }}>
              <p id="confirm-msg" style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                {state.message}
              </p>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => respond(false)}
                autoFocus
                style={{
                  background: '#fff', border: '1px solid #dbeafe', color: '#374151',
                  borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#93c5fd')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#dbeafe')}
              >
                {state.options.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => respond(true)}
                style={{
                  background: isDanger ? '#dc2626' : '#2563eb',
                  color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isDanger ? '#b91c1c' : '#1d4ed8')}
                onMouseLeave={e => (e.currentTarget.style.background = isDanger ? '#dc2626' : '#2563eb')}
              >
                {state.options.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): (message: string, options?: ConfirmOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmDialogProvider>')
  return ctx.confirm
}
