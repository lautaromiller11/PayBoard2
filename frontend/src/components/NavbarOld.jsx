import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import favicon from './favicon.ico';
import { useState } from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function NavbarOld() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600';
    };

    return (
        <nav className="bg-white shadow-sm border-b w-full">
            <div className="flex items-center justify-between px-2 sm:px-6 h-16 w-full">
                {/* Logo/Brand */}
                <Link to="/" className="flex items-center min-w-0">
                    <img src={favicon} alt="PayBoard logo" className="h-6 w-6 mr-2" />
                    <h1 className="text-xl font-bold text-gray-800 truncate">PayBoard</h1>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex gap-6 flex-1 justify-center items-center min-w-0">
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

                {/* User Menu (Desktop) */}
                <div className="hidden sm:flex items-center gap-4">
                    <span className="text-sm text-gray-700 hidden md:inline-block">
                        {user?.email || 'Usuario'}
                    </span>
                    <div className="flex items-center">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600"
                        >
                            <FaSignOutAlt />
                            <span className="hidden md:inline-block">Cerrar sesión</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="sm:hidden">
                    <button
                        className="p-2 rounded-md text-gray-600"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <FaBars size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {menuOpen && (
                <div className="sm:hidden bg-white border-t shadow-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/servicios"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/servicios')}`}
                        >
                            Mis servicios
                        </Link>
                        <Link
                            to="/finanzas"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/finanzas')}`}
                        >
                            Finanzas personales
                        </Link>
                        <Link
                            to="/cotizaciones"
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/cotizaciones')}`}
                        >
                            Cotizaciones
                        </Link>
                        <div className="border-t mt-2 pt-2">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-red-600"
                            >
                                <FaSignOutAlt />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
