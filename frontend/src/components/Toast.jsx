import React, { useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

let toastFn = null

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => { toastFn = show }, [show])

  return { toasts, show }
}

export const toast = (message, type = 'info') => {
  if (toastFn) toastFn(message, type)
}

export default function ToastContainer({ toasts }) {
  const icons = { success: CheckCircle, error: XCircle, info: Info }
  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              {t.message}
            </div>
          </div>
        )
      })}
    </div>
  )
}