import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const handleProfileClick = () => setMenuOpen(!menuOpen);
  const handleGoToProfile = () => {
    setMenuOpen(false);
    window.location.href = '/perfil';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">PayBoard</h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/servicios"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/servicios')}`}
            >
              Mis Servicios
            </Link>
            <Link
              to="/finanzas"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/finanzas')}`}
            >
              Finanzas Personales
            </Link>
            <Link
              to="/cotizaciones"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/cotizaciones')}`}
            >
              Cotizaciones
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative flex items-center space-x-4">
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              title="Perfil"
            >
              {/* SVG icon user */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 1115 0v.75A2.25 2.25 0 0117.25 23H6.75A2.25 2.25 0 014.5 21v-.75z" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 bg-white border rounded shadow-lg p-4 z-50 min-w-[200px]">
                <div className="mb-2 text-gray-800 font-semibold">Perfil de Usuario</div>
                <div className="mb-2 text-sm text-gray-600">Correo: {user?.email}</div>
                <button
                  onClick={handleGoToProfile}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-2"
                >
                  Ver perfil
                </button>
                <button
                  onClick={handleProfileClick}
                  className="w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
