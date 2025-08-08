import Footer from '../components/Footer';
import NavbarHome from '../components/NavbarHome';
import { FaMoneyCheckAlt, FaChartLine, FaLink, FaRobot } from 'react-icons/fa';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavbarHome />
            <main className="flex-1 flex flex-col items-center px-4">
                <h1 className="text-5xl font-bold text-blue-700 mt-10 mb-6 text-center leading-tight">PayBoard</h1>
                <p className="text-xl text-gray-700 mb-6 text-center leading-relaxed">Tu plataforma integral para gestionar servicios y finanzas personales completamente gratis</p>
                <p className="text-blue-600 font-medium mb-12 text-center leading-relaxed">Gestiona tus pagos, registra tus gastos y mantén todo conectado en un solo lugar</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
                    <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center border">
                        <FaMoneyCheckAlt className="text-blue-600 text-3xl mb-3" />
                        <h2 className="text-xl font-bold mb-2">Organización de Servicios</h2>
                        <p className="text-gray-700">Organiza, paga y controla todos tus servicios desde un tablero visual y fácil de usar.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center border">
                        <FaChartLine className="text-green-600 text-3xl mb-3" />
                        <h2 className="text-xl font-bold mb-2">Finanzas Personales</h2>
                        <p className="text-gray-700">Registra ingresos y gastos, visualiza tu balance y toma mejores decisiones financieras.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center border">
                        <FaLink className="text-purple-600 text-3xl mb-3" />
                        <h2 className="text-xl font-bold mb-2">Conexión entre Módulos</h2>
                        <p className="text-gray-700">Tus pagos y servicios se reflejan automáticamente en tu historial financiero.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center border">
                        <FaRobot className="text-yellow-500 text-3xl mb-3" />
                        <h2 className="text-xl font-bold mb-2">Registro Inteligente</h2>
                        <p className="text-gray-700">Simplifica el control de tus finanzas registrando tus gastos para ahorrar tiempo y evitar olvidos.</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mb-12">
                    <h2 className="text-2xl font-bold text-center mb-4">¿Por qué elegir PayBoard?</h2>
                    <ul className="list-disc text-gray-700 pl-6 space-y-2">
                        <li>Centraliza la gestión de servicios y finanzas</li>
                        <li>Interfaz moderna, intuitiva y responsive</li>
                        <li>Automatización de pagos y gastos</li>
                        <li>Visualización clara de tu balance y gastos</li>
                        <li>Conexión automática entre módulos</li>
                        <li>Seguridad y privacidad de tus datos</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}
