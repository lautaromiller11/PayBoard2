import React from 'react';

import { Link, useNavigate } from 'react-router-dom';
import favicon from './favicon.ico';
import { useAuth } from '../context/AuthContext';

export default function NavbarHome() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const handleLoginClick = () => {
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };
    return (
        <nav className="bg-white shadow-sm border-b w-full">
            <div className="flex flex-nowrap items-center justify-between px-4 py-2 h-16 w-full">
                {/* Logo/Brand */}
                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity min-w-0">
                    <img src={favicon} alt="PayBoard Logo" className="h-8 w-8 mr-2 flex-shrink-0" />
                    <span className="text-lg sm:text-2xl font-semibold text-[#222] truncate">PayBoard</span>
                </Link>
                {/* Botones siempre visibles y alineados */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Link to="/register" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors border border-blue-600 whitespace-nowrap">Registrarse</Link>
                    <button type="button" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors border border-blue-600 whitespace-nowrap" onClick={handleLoginClick}>Iniciar Sesión</button>
                </div>
            </div>
        </nav>
    );
}
