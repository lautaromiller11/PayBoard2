
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import favicon from './favicon.ico';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600';
    };

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="w-full px-6 flex items-center justify-between h-16">
                {/* Logo/Brand */}
                <Link to="/" className="flex items-center pl-2 hover:opacity-80 transition-opacity">
                    <img src={favicon} alt="PayBoard Logo" className="h-7 w-7 mr-2" />
                    <span className="text-2xl font-semibold text-[#222]">PayBoard</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/servicios"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/servicios')}`}
                    >
                        Servicios
                    </Link>
                    <Link
                        to="/finanzas"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/finanzas')}`}
                    >
                        Finanzas Personales
                    </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3 pr-2">
                    <span className="text-sm text-gray-600">{user?.email}</span>
                    <button
                        onClick={logout}
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </nav>
    );
}
