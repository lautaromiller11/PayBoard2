import { Link } from 'react-router-dom';
import favicon from './favicon.ico';

export default function NavbarSimple() {
    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="w-full px-6 flex items-center justify-start h-16">
                <Link to="/" className="flex items-center pl-2 hover:opacity-80 transition-opacity">
                    <img src={favicon} alt="PayBoard Logo" className="h-8 w-8 mr-2" />
                    <span className="text-2xl font-semibold text-[#222]">PayBoard</span>
                </Link>
            </div>
        </nav>
    );
}
