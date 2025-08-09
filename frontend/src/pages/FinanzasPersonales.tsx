import { useState, useEffect } from 'react'
import { useSync } from '../context/SyncContext'
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
  const { finanzasNeedsSync, resetFinanzasSync } = useSync();
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
    const fecha = new Date();
    return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Obtener año y mes del filtro seleccionado
  const [año, mes] = mesSeleccionado.split('-').map(Number)

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadData();
  }, [mes, año, filtroTipo]);

  // Sincronizar cuando se edita/paga/elimina un servicio
  useEffect(() => {
    if (finanzasNeedsSync) {
      loadData();
      resetFinanzasSync();
    }
  }, [finanzasNeedsSync]);

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
            {/* Eliminado: Control financiero - {nombreMes} */}
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

        {/* Resumen del mes y debajo historial de transacciones */}
        {resumen && (
          <div className="mb-6">
            {/* Título de análisis financiero arriba del resumen del mes */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                Análisis Financiero - {new Date(año, mes - 1).toLocaleDateString('es-ES', { month: 'long' })} {año}
              </h3>
            </div>
            {/* Resumen textual */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Resumen del Mes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {resumen.totales && resumen.totales.ingresos !== undefined ? resumen.totales.ingresos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : 0}
                  </div>
                  <div className="text-sm text-green-700">Total Ingresos</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {resumen.totales && resumen.totales.gastos !== undefined ? resumen.totales.gastos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : 0}
                  </div>
                  <div className="text-sm text-red-700">Total Gastos</div>
                </div>
                <div className={`p-4 rounded-lg ${resumen.totales.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <div className={`text-2xl font-bold ${resumen.totales.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {resumen.totales && resumen.totales.balance !== undefined ? resumen.totales.balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : 0}
                  </div>
                  <div className={`text-sm ${resumen.totales.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    Balance {resumen.totales.balance >= 0 ? 'Positivo' : 'Negativo'}
                  </div>
                </div>
              </div>
              {/* Mensaje motivacional */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-600">
                  {resumen.totales.balance >= 0
                    ? '¡Excelente! Tienes un balance positivo este mes. 💰'
                    : 'Considera revisar tus gastos para mejorar tu balance. 📊'
                  }
                </div>
              </div>
            </div>
            {/* Historial de transacciones debajo del resumen */}
            <div className="mb-6">
              <TransactionList
                transacciones={transacciones}
                onTransaccionDeleted={handleTransaccionDeleted}
                loading={loading}
              />
            </div>
            {/* Gráfico ingresos vs gastos */}
            <FinancialChart resumen={resumen} mes={mes} año={año} />
          </div>
        )}

        {/* Nota informativa eliminada */}
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
