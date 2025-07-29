import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  PropsWithChildren,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './toastProvider.module.css'

/* ---------- Typen ---------- */

type Toast = {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void | Promise<void>
  duration?: number // ms
}

type ToastAPI = {
  show: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

/** Mögliche Platzierungen des Toast-Stacks. */
type Placement = 'bottom-right' | 'bottom-center' | 'top-right' | 'top-center'

/* ---------- Context ---------- */

const ToastCtx = createContext<ToastAPI | null>(null)

/* ---------- Provider-Komponente ---------- */

type ProviderProps = PropsWithChildren<{ placement?: Placement }>

export const ToastProvider: React.FC<ProviderProps> = ({
  children,
  placement = 'bottom-right',
}) => {
  // Interner Zustand für die Toast-Liste
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextIdRef = useRef(1)
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  /** Entfernt einen Toast und räumt den zugehörigen Timer auf. */
  const dismiss = useCallback((id: number) => {
    setToasts((s) => s.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  /** Zeigt neuen Toast (optional mit Auto-Dismiss). */
  const show = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextIdRef.current++
      const duration = toast.duration ?? 4000
      setToasts((s) => [...s, { ...toast, id, duration }])
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timersRef.current.set(id, timer)
      }
    },
    [dismiss],
  )

  /** Führt die optionale Aktion aus und schließt den Toast. */
  const handleAction = useCallback(
    async (t: Toast) => {
      const fn = t.onAction
      try {
        if (fn) await fn()
      } finally {
        dismiss(t.id)
      }
    },
    [dismiss],
  )

  // Aufräumen aller Timer beim Unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  // Positionsklasse für den Container bestimmen
  const posClass =
    placement === 'bottom-right'
      ? styles.posBottomRight
      : placement === 'bottom-center'
        ? styles.posBottomCenter
        : placement === 'top-right'
          ? styles.posTopRight
          : styles.posTopCenter

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}

      {createPortal(
        <div className={`${styles.container} ${posClass}`} aria-live="polite" aria-atomic="true">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={styles.toast}
              role="status"
              style={{ ['--toast-duration' as any]: `${t.duration ?? 4000}ms` }}
            >
              <div className={styles.message}>{t.message}</div>

              {t.actionLabel && (
                <button className={styles.action} onClick={() => handleAction(t)}>
                  {t.actionLabel}
                </button>
              )}

              <button className={styles.close} aria-label="Schließen" onClick={() => dismiss(t.id)}>
                ×
              </button>

              {/* Visueller Timer für Auto-Dismiss (läuft von voll → leer) */}
              <div className={styles.progress} aria-hidden="true" />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  )
}

/** Hook zum Zugriff auf die Toast-API. */
export const useToast = (): ToastAPI => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast muss innerhalb von <ToastProvider> verwendet werden.')
  return ctx
}
