'use client'

import { createContext, useContext, useEffect } from 'react'
import { toast } from 'sonner'
import { useErrorStore } from '@/stores/errorStore'

type ErrorContextType = {
  showError: (message: string) => void
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const setShowError = useErrorStore((state: { setShowError: (handler: (message: string) => void) => void }) => 
    state.setShowError
  )

  const showError = (message: string) => {
    toast.error(message, {
      duration: 4000,
    })
  }

  useEffect(() => {
    setShowError(showError)
    return () => setShowError(() => {})
  }, [setShowError])

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
} 