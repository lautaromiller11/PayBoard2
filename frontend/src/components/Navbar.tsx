import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
