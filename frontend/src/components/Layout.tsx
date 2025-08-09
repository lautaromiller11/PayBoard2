import { ReactNode } from 'react'
import Navbar from './Navbar.tsx'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
