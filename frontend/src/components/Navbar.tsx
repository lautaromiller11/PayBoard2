import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import { FaBars, FaUserCircle, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'dark:text-gray-300 text-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
  }

  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-dark-bg-primary shadow-sm border-b dark:border-dark-600 w-full theme-transition">
      <div className="w-full px-2 sm:px-6">
        {/* Mobile: logo y menú arriba, botones abajo */}
        <div className="block sm:hidden w-full">
          <div className="flex items-center justify-between h-16 w-full">
            <Link to="/" className="flex items-center min-w-0 pl-2 hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">PayBoard</h1>
            </Link>
            <div className="flex items-center pr-2">
              <div className="relative">
                <button
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-accent focus:outline-none"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Abrir menú de usuario"
                >
                  <FaBars size={24} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-secondary rounded shadow-lg shadow-gray-300 dark:shadow-gray-900/40 z-50 border dark:border-dark-600 py-2">
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg-accent text-left"
                    >
                      {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
                      {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    </button>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg-accent text-left"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaUserCircle /> Perfil
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg-accent text-left"
                    >
                      <FaSignOutAlt /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 py-2 w-full bg-white dark:bg-dark-bg-primary">
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white truncate">PayBoard</h1>
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
          <div className="flex items-center pr-2 gap-3 relative">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-accent transition-colors"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={16} />}
            </button>
            <Link
              to="/perfil"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${isActive('/perfil')}`}
            >
              <FaUserCircle /> Perfil
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            >
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
