import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { FaTelegramPlane, FaCheckCircle } from 'react-icons/fa'

type UserProfile = {
  nombre: string
  apellido: string
  fechaNacimiento: string
}

export default function Perfil() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
  })
  const [botLinked, setBotLinked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Función para manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  // Validación para no permitir fechas futuras
  const validateDate = (date: string) => {
    if (!date) return true
    const selectedDate = new Date(date)
    const today = new Date()
    return selectedDate <= today
  }

  // Función para guardar el perfil
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar fecha
    if (!validateDate(profile.fechaNacimiento)) {
      alert('La fecha de nacimiento no puede ser futura')
      return
    }
    
    // Simulamos el guardado (en un escenario real, aquí se haría la llamada a la API)
    console.log('Guardando perfil:', profile)
    
    // Mostrar mensaje de éxito
    setShowSuccess(true)
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Mi Perfil</h1>
        
        {showSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
            <p className="flex items-center">
              <FaCheckCircle className="mr-2" /> 
              Cambios guardados correctamente
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda - Información personal */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Información Personal</h2>
            
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-bg-accent border border-gray-300 dark:border-dark-600 rounded-md text-gray-800 dark:text-gray-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El correo electrónico no se puede modificar</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={profile.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-bg-accent border border-gray-300 dark:border-dark-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="apellido">
                  Apellido
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={profile.apellido}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-bg-accent border border-gray-300 dark:border-dark-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="fechaNacimiento">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={profile.fechaNacimiento}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-bg-accent border border-gray-300 dark:border-dark-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
          
          {/* Columna derecha - Enlace con Telegram */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
              Enlace con Telegram 
              <FaTelegramPlane className="ml-2 text-blue-500" />
            </h2>
            
            <div className="mb-4 flex items-center">
              <div className={`w-3 h-3 rounded-full ${botLinked ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {botLinked ? 'Bot enlazado' : 'No enlazado'}
              </span>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                ¿Cómo enlazar tu cuenta?
              </h3>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li className="text-gray-700 dark:text-gray-300">
                  Busca el bot <span className="font-mono bg-gray-100 dark:bg-dark-bg-accent px-1 rounded">@PayBoardBot</span> en Telegram
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  Inicia la conversación con el comando <span className="font-mono bg-gray-100 dark:bg-dark-bg-accent px-1 rounded">/start</span>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  El bot te pedirá que inicies sesión con tu cuenta
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  Una vez autenticado, tu cuenta quedará vinculada automáticamente
                </li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-white">Beneficios:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Recibe notificaciones de pagos pendientes</li>
                <li>Consulta tus finanzas desde Telegram</li>
                <li>Obtén recordatorios de vencimientos</li>
              </ul>
            </div>
            
            <a
              href="https://t.me/PayBoardBot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Abrir Telegram y Conectar
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
