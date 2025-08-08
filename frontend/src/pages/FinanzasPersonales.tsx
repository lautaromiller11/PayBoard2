import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import TransactionForm from '../ui/TransactionForm'
import TransactionList from '../ui/TransactionList'
import FinancialChart from '../ui/FinancialChart'
import { 
  fetchTransacciones, 
  fetchResumenFinanciero, 
  Transaccion, 
  ResumenFinanciero 
} from '../lib/api'

export default function FinanzasPersonales() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para modales
  const [modalIngresoOpen, setModalIngresoOpen] = useState(false)
  const [modalGastoOpen, setModalGastoOpen] = useState(false)
  
  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ingreso' | 'gasto'>('todos')
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  // Obtener año y mes del filtro seleccionado
  const [año, mes] = mesSeleccionado.split('-').map(Number)

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadData()
  }, [mes, año, filtroTipo])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar transacciones y resumen en paralelo
      const [transaccionesData, resumenData] = await Promise.all([
        fetchTransacciones(mes, año, filtroTipo === 'todos' ? undefined : filtroTipo),
        fetchResumenFinanciero(año, mes)
      ])

      setTransacciones(transaccionesData)
      setResumen(resumenData)
    } catch (err) {
      console.error('Error loading financial data:', err)
      setError('Error al cargar los datos financieros')
    } finally {
      setLoading(false)
    }
  }

  // Manejar creación de nueva transacción
  const handleTransaccionCreated = (nuevaTransaccion: Transaccion) => {
    setTransacciones(prev => [nuevaTransaccion, ...prev])
    // Recargar datos para actualizar el resumen
    loadData()
  }

  // Manejar eliminación de transacción
  const handleTransaccionDeleted = (id: number) => {
    setTransacciones(prev => prev.filter(t => t.id !== id))
    // Recargar datos para actualizar el resumen
    loadData()
  }

  // Formatear nombre del mes
  const nombreMes = new Date(año, mes - 1).toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Cargando datos financieros...</div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finanzas Personales</h1>
            <p className="text-gray-600 mt-1 capitalize">
              Control financiero - {nombreMes}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              + Nuevo Ingreso
            </button>
            <button
              onClick={() => setModalGastoOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              + Nuevo Gasto
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Mes:</label>
              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Tipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumen financiero con gráficos */}
        {resumen && (
          <div className="mb-6">
            <FinancialChart resumen={resumen} mes={mes} año={año} />
          </div>
        )}

        {/* Lista de transacciones */}
        <div className="mb-6">
          <TransactionList 
            transacciones={transacciones}
            onTransaccionDeleted={handleTransaccionDeleted}
            loading={loading}
          />
        </div>

        {/* Nota informativa */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 mr-3 flex-shrink-0"></div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Funcionalidades disponibles</h3>
              <p className="text-sm text-blue-700">
                • Registro completo de ingresos y gastos con periodicidad<br/>
                • Gráficos comparativos y análisis por categorías<br/>
                • Transacciones mensuales automáticas<br/>
                • Próximamente: integración automática con servicios pagados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modales para crear transacciones */}
      {modalIngresoOpen && (
        <TransactionForm
          tipo="ingreso"
          onClose={() => setModalIngresoOpen(false)}
          onCreated={handleTransaccionCreated}
        />
      )}

      {modalGastoOpen && (
        <TransactionForm
          tipo="gasto"
          onClose={() => setModalGastoOpen(false)}
          onCreated={handleTransaccionCreated}
        />
      )}
    </Layout>
  )
}
