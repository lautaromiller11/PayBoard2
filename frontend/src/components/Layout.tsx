import { ReactNode } from 'react'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors">
      <Navbar />
      <main className="p-6 text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </div>
  )
}
