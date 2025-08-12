import { useEffect, useState } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export default function Notification({ message, type, onClose, duration = 5000 }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Esperar a que termine la animación
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800 text-green-700 dark:text-green-400'
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-700 dark:text-red-400'
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-800 text-blue-700 dark:text-blue-400'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
    >
      <div className={`border-l-4 p-4 rounded shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">{getIcon()}</span>
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="ml-4 text-lg font-bold opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
