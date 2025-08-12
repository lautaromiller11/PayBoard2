import Footer from '../components/Footer';
import NavbarHome from '../components/NavbarHome';
import { FaMoneyCheckAlt, FaChartLine, FaLink, FaRobot, FaTelegramPlane } from 'react-icons/fa';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavbarHome />
            <main className="flex-1 flex flex-col items-center px-4">
                <h1 className="text-5xl font-bold text-blue-700 mt-10 mb-6 text-center leading-tight">PayBoard</h1>
                <p className="text-xl text-gray-700 mb-6 text-center leading-relaxed">Tu plataforma integral para gestionar servicios y finanzas personales completamente gratis</p>
                <p className="text-blue-600 font-medium mb-12 text-center leading-relaxed">Gestiona tus pagos, registra tus gastos y mantén todo conectado en un solo lugar</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
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
                        <span className="text-indigo-600 text-3xl mb-3">💱</span>
                        <h2 className="text-xl font-bold mb-2">Cotizaciones en Vivo</h2>
                        <p className="text-gray-700">Consulta las principales tasas y valores actualizados al instante. Todo en un solo lugar.</p>
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
                    <div className="bg-white rounded-xl shadow p-8 text-center flex flex-col items-center border">
                        <FaTelegramPlane className="text-sky-500 text-3xl mb-3" />
                        <h2 className="text-xl font-bold mb-2">Integración con Telegram</h2>
                        <p className="text-gray-700">Carga gastos e ingresos al instante desde nuestro bot de Telegram para un registro más rápido.</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mb-12">
                    <h2 className="text-2xl font-bold text-center mb-4">¿Por qué elegir PayBoard?</h2>
                    <ul className="list-disc text-gray-700 pl-6 space-y-2">
                        <li>Plataforma 100% gratuita para gestionar servicios y finanzas personales.</li>
                        <li>Centraliza pagos, gastos, ingresos y control de servicios en un solo lugar.</li>
                        <li>Interfaz moderna, intuitiva y totalmente responsive.</li>
                        <li>Visualización clara de tu balance, historial y estadísticas financieras.</li>
                        <li>Sincronización automática entre módulos.</li>
                        <li>Seguridad y privacidad garantizada para tus datos.</li>
                        <li>Soporte para múltiples categorías, servicios recurrentes y pagos online.</li>
                        <li>Cotizaciones en vivo: consulta tasas y valores actualizados al instante.</li>
                        <li>Acceso rápido desde cualquier dispositivo, sin costos ocultos.</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}
