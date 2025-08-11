import { useState, useEffect } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
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

  // Estado calendario y mes seleccionado
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Obtener año y mes del filtro seleccionado
  const [año, mes] = mesSeleccionado.split('-').map(Number)

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadData();
  }, [mes, año]);

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
        fetchTransacciones(mes, año),
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finanzas Personales</h1>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            {/* Calendario con icono, abre modal visual */}
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onClick={() => setCalendarOpen(true)}
              aria-label="Seleccionar mes"
            >
              <FaCalendarAlt size={18} />
              <span className="hidden sm:inline">Mes</span>
            </button>
            <button
              onClick={() => setModalIngresoOpen(true)}
              className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm whitespace-nowrap"
            >
              + Nuevo Ingreso
            </button>
            <button
              onClick={() => setModalGastoOpen(true)}
              className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm whitespace-nowrap"
            >
              + Nuevo Gasto
            </button>
            {/* Modal calendario */}
            {calendarOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-full flex flex-col items-center">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Selecciona el mes</h2>
                  <input
                    type="month"
                    value={mesSeleccionado}
                    onChange={e => {
                      setMesSeleccionado(e.target.value);
                      setCalendarOpen(false);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 w-full"
                  />
                  <button
                    onClick={() => setCalendarOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filtros eliminados, solo calendario arriba */}

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
