import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaCheckCircle, FaWallet, FaListAlt, FaChartPie, FaLink, FaDatabase, FaMoneyBillWave } from 'react-icons/fa';
import NavbarSimple from '../components/NavbarSimple';

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [repeatPassword, setRepeatPassword] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await register(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Fondo decorativo con íconos tenues */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <span className="absolute top-10 left-1/3 text-blue-200 opacity-30"><FaWallet size={70} /></span>
        <span className="absolute top-1/2 left-1/5 text-purple-200 opacity-20"><FaChartPie size={80} /></span>
        <span className="absolute top-2/3 right-1/4 text-yellow-200 opacity-20"><FaLink size={80} /></span>
        <span className="absolute bottom-24 left-1/4 text-green-200 opacity-20"><FaListAlt size={70} /></span>
        <span className="absolute bottom-1/3 right-1/6 text-gray-300 opacity-20"><FaDatabase size={60} /></span>
        <span className="absolute top-1/4 left-1/8 text-green-300 opacity-20"><FaMoneyBillWave size={80} /></span>
        {/* Más íconos decorativos, menos saturados y en nuevas posiciones */}
        <span className="absolute top-1/6 right-1/3 text-blue-200 opacity-10"><FaWallet size={40} /></span>
        <span className="absolute top-2/5 left-1/2 text-purple-200 opacity-10"><FaChartPie size={50} /></span>
        <span className="absolute bottom-1/4 left-1/2 text-yellow-200 opacity-10"><FaLink size={40} /></span>
        <span className="absolute bottom-1/8 right-1/3 text-green-200 opacity-10"><FaListAlt size={40} /></span>
        <span className="absolute top-1/8 left-1/3 text-gray-300 opacity-10"><FaDatabase size={30} /></span>
        <span className="absolute bottom-1/8 left-1/8 text-green-300 opacity-10"><FaMoneyBillWave size={40} /></span>
      </div>
      <NavbarSimple />
      <div className="flex flex-col items-center justify-center w-full px-4 py-12 relative z-10">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-8 md:p-16 flex flex-col md:flex-row gap-12 xl:gap-40 items-center">
          {/* Textos informativos a la izquierda */}
          <div className="flex-1 w-full xl:max-w-xl md:pr-16 xl:pr-24 mb-8 md:mb-0 flex flex-col justify-center" style={{ minHeight: '100%' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-8 text-left mt-0 md:mt-[-128px]">Controla tus finanzas y servicios fácilmente</h1>
            <ul className="mb-8 flex flex-col gap-4 text-base md:text-lg text-gray-700">
              <li className="flex items-center gap-4 whitespace-nowrap"><FaWallet size={22} color="#2563eb" /> Registra y controla tus gastos e ingresos</li>
              <li className="flex items-center gap-4 whitespace-nowrap"><FaListAlt size={22} color="#22c55e" /> Organiza todos tus servicios y pagos</li>
              <li className="flex items-center gap-4 whitespace-nowrap"><FaChartPie size={22} color="#a855f7" /> Visualiza tu balance financiero claramente</li>
              <li className="flex items-center gap-4 whitespace-nowrap"><FaLink size={22} color="#eab308" /> Conecta automáticamente tus módulos</li>
              <li className="flex items-center gap-4 whitespace-nowrap"><FaCheckCircle size={22} color="#2563eb" /> <span className="font-bold">¡Es gratis!</span></li>
            </ul>
            <p className="text-base text-gray-700 mt-2 mb-2 leading-relaxed whitespace-nowrap">Regístrate gratis y organiza tus finanzas hoy mismo.</p>
          </div>
          {/* Formulario a la derecha */}
          <div className="flex-1 w-full md:max-w-md md:ml-0 xl:ml-2">
            <form onSubmit={onSubmit} className="bg-gray-50 border border-gray-200 rounded-xl shadow p-6 md:p-8 flex flex-col" style={{ minWidth: '320px', width: '100%' }}>
              <h2 className="text-xl font-bold mb-4 text-center">Empieza gratis en segundos</h2>
              <div className="mb-5">
                <label className="block text-sm font-bold mb-2">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded px-4 py-3 text-base" style={{ minWidth: '320px', width: '100%' }} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full border rounded px-4 py-3 text-base" style={{ minWidth: '320px', width: '100%' }} required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Repetir contraseña</label>
                <input value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} type="password" className="w-full border rounded px-4 py-3 text-base" style={{ minWidth: '320px', width: '100%' }} required />
              </div>
              <div className="relative h-6 mb-4">
                {error && (
                  <p className="absolute left-0 top-0 text-red-600 text-sm w-full text-center">{error}</p>
                )}
              </div>
              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-bold text-lg mt-2 mb-2">
                {loading ? 'Creando...' : 'Empieza ahora'}
              </button>
              <p className="text-xs text-blue-700 text-center mb-2 font-semibold">Sin tarjeta de crédito. 100% gratis.</p>
              <p className="text-sm text-gray-600 mt-2 text-center">¿Ya tienes cuenta? <Link className="text-blue-600 font-semibold" to="/login">Inicia sesión</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}




