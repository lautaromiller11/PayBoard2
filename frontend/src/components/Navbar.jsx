
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import favicon from './favicon.ico';
import { useState } from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
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
                <Link to="/" className="flex items-center min-w-0 pl-2 hover:opacity-80 transition-opacity">
                    <img src={favicon} alt="PayBoard Logo" className="h-7 w-7 mr-2 flex-shrink-0" />
                    <span className="text-xl sm:text-2xl font-semibold text-[#222] truncate">PayBoard</span>
                </Link>
                {/* Navigation Links - adaptative, avoid overlap */}
                <div className="flex-1 flex justify-center items-center min-w-0">
                    <div className="flex gap-1 sm:gap-4 flex-wrap">
                        <Link
                            to="/servicios"
                            className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${isActive('/servicios')}`}
                        >
                            Mis servicios
                        </Link>
                        <Link
                            to="/finanzas"
                            className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${isActive('/finanzas')}`}
                        >
                            Finanzas personales
                        </Link>
                        <Link
                            to="/cotizaciones"
                            className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${isActive('/cotizaciones')}`}
                        >
                            Cotizaciones
                        </Link>
                    </div>
                </div>
                {/* User Menu - hamburger for mobile */}
                <div className="flex items-center pr-2">
                    <div className="sm:hidden relative">
                        <button
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Abrir menú de usuario"
                        >
                            <FaBars className="text-xl" />
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
                    <div className="hidden sm:flex items-center gap-3">
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
    );
}
