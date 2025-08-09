
import { Link } from 'react-router-dom';
import favicon from './favicon.ico';

export default function NavbarHome() {
    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="w-full px-6 flex items-center justify-between h-16">
                {/* Logo/Brand */}
                <Link to="/" className="flex items-center pl-2 hover:opacity-80 transition-opacity">
                    <img src={favicon} alt="PayBoard Logo" className="h-8 w-8 mr-2" />
                    <span className="text-2xl font-semibold text-[#222]">PayBoard</span>
                </Link>
                {/* Botones de acción */}
                <div className="flex items-center gap-3 pr-2">
                    <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors border border-blue-600">Registrarse</Link>
                    <Link to="/login" className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors border border-blue-600">Iniciar Sesión</Link>
                </div>
            </div>
        </nav>
    );
}
