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
      {/* Fondo decorativo con íconos tenues, menos saturados en mobile */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <span className="hidden sm:block absolute top-10 left-1/3 text-blue-200 opacity-30"><FaWallet size={70} /></span>
        <span className="hidden sm:block absolute top-1/2 left-1/5 text-purple-200 opacity-20"><FaChartPie size={80} /></span>
        <span className="hidden sm:block absolute top-2/3 right-1/4 text-yellow-200 opacity-20"><FaLink size={80} /></span>
        <span className="hidden sm:block absolute bottom-24 left-1/4 text-green-200 opacity-20"><FaListAlt size={70} /></span>
        <span className="hidden sm:block absolute bottom-1/3 right-1/6 text-gray-300 opacity-20"><FaDatabase size={60} /></span>
        <span className="hidden sm:block absolute top-1/4 left-1/8 text-green-300 opacity-20"><FaMoneyBillWave size={80} /></span>
      </div>
      <NavbarSimple />
      <div className="flex flex-col items-center justify-center w-full px-2 py-8 sm:px-4 sm:py-12 relative z-10">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 sm:p-8 flex flex-col sm:flex-row gap-16 items-center">
          {/* Textos informativos arriba en mobile, izquierda en desktop */}
          <div className="w-full sm:w-1/2 flex flex-col justify-center items-center sm:items-start mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 text-center sm:text-left">Controla tus finanzas y servicios fácilmente</h1>
            <ul className="mb-6 flex flex-col gap-3 text-base sm:text-lg text-gray-700 w-full">
              <li className="flex items-center gap-3 whitespace-nowrap"><FaWallet size={20} color="#2563eb" /> Registra y controla tus gastos e ingresos</li>
              <li className="flex items-center gap-3 whitespace-nowrap"><FaListAlt size={20} color="#22c55e" /> Organiza todos tus servicios y pagos</li>
              <li className="flex items-center gap-3 whitespace-nowrap"><FaChartPie size={20} color="#a855f7" /> Visualiza tu balance financiero claramente</li>
              <li className="flex items-center gap-3 whitespace-nowrap"><FaLink size={20} color="#eab308" /> Conecta automáticamente tus módulos</li>
              <li className="flex items-center gap-3 whitespace-nowrap"><FaCheckCircle size={20} color="#2563eb" /> <span className="font-bold">¡Es gratis!</span></li>
            </ul>
            <p className="text-base text-gray-700 mb-2 leading-relaxed text-center sm:text-left">Regístrate gratis y organiza tus finanzas hoy mismo.</p>
          </div>
          {/* Formulario adaptativo */}
          <div className="w-full max-w-md sm:w-[420px]">
            <form onSubmit={onSubmit} className="bg-gray-50 border border-gray-200 rounded-xl shadow p-4 sm:p-8 flex flex-col w-full">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Empieza gratis en segundos</h2>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2 text-base" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2 text-base" required />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold mb-2">Repetir contraseña</label>
                <input value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2 text-base" required />
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




