import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'

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
    <nav className="bg-white shadow-sm border-b w-full">
      <div className="w-full px-2 sm:px-6">
        {/* Mobile: logo y menú arriba, botones abajo */}
        <div className="block sm:hidden w-full">
          <div className="flex items-center justify-between h-16 w-full">
            <Link to="/" className="flex items-center min-w-0 pl-2 hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-gray-800 truncate">PayBoard</h1>
            </Link>
            <div className="flex items-center pr-2">
              <div className="relative">
                <button
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Abrir menú de usuario"
                >
                  <FaBars size={24} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50 border">
                    <Link to="/perfil" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <FaUserCircle /> Perfil
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <FaSignOutAlt /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 py-2 w-full">
            <Link
              to="/servicios"
              className={`px-2 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${isActive('/servicios')}`}
            >
              Mis servicios
            </Link>
            <Link
              to="/finanzas"
              className={`px-2 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${isActive('/finanzas')}`}
            >
              Finanzas personales
            </Link>
            <Link
              to="/cotizaciones"
              className={`px-2 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${isActive('/cotizaciones')}`}
            >
              Cotizaciones
            </Link>
          </div>
        </div>
        {/* Desktop: todo en una sola fila */}
        <div className="hidden sm:flex items-center justify-between h-16 w-full">
          <Link to="/" className="flex items-center min-w-0 pl-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-gray-800 truncate">PayBoard</h1>
          </Link>
          <div className="flex gap-6 flex-1 justify-center items-center min-w-0">
            <Link
              to="/servicios"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive('/servicios')}`}
            >
              Mis servicios
            </Link>
            <Link
              to="/finanzas"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive('/finanzas')}`}
            >
              Finanzas personales
            </Link>
            <Link
              to="/cotizaciones"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive('/cotizaciones')}`}
            >
              Cotizaciones
            </Link>
          </div>
          <div className="flex items-center pr-2 gap-3">
            <Link to="/perfil" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600">
              <FaUserCircle /> Perfil
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600"
            >
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
