import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useEffect, useMemo, useState } from 'react'
import { changeEstado, createPago, deleteServicio, fetchServicios, Servicio } from '../lib/api'
import ServiceForm from '../ui/ServiceForm'
import Layout from '../components/Layout'

type ColumnKey = 'por_pagar' | 'pagado' | 'vencido'

const columnTitles = {
  por_pagar: 'Por Pagar',
  pagado: 'Pagado',
  vencido: 'Vencido'
}

const columnColors = {
  por_pagar: 'bg-yellow-50 border-yellow-200',
  pagado: 'bg-green-50 border-green-200',
  vencido: 'bg-red-50 border-red-200'
}

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Agrupar servicios por estado
  const grouped = useMemo(() => ({
    por_pagar: servicios.filter(s => s.estado === 'por_pagar'),
    pagado: servicios.filter(s => s.estado === 'pagado'),
    vencido: servicios.filter(s => s.estado === 'vencido'),
  }), [servicios])

  // Cargar servicios al montar el componente
  useEffect(() => {
    loadServicios()
  }, [])

  const loadServicios = async () => {
    try {
      setLoading(true)
      const data = await fetchServicios()
      setServicios(data)
    } catch {
      setError('No se pudieron cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  // Manejar drag & drop entre columnas
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    const destCol = destination.droppableId as ColumnKey
    const srcCol = source.droppableId as ColumnKey

    if (destCol === srcCol) return

    const id = Number(draggableId)

    try {
      const updated = await changeEstado(id, destCol)
      setServicios(prev => prev.map(s => s.id === id ? updated : s))
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      // Aquí podrías mostrar una notificación de error
    }
  }

  // Eliminar servicio
  const onDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return
    }

    try {
      await deleteServicio(id)
      setServicios(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      // Aquí podrías mostrar una notificación de error
    }
  }

  // Marcar servicio como pagado
  const onPay = async (s: Servicio) => {
    try {
      const today = new Date().toISOString()
      // Registrar el pago
      await createPago({ servicioId: s.id, fechaPago: today, montoPagado: s.monto })
      // Cambiar estado a pagado
      const updated = await changeEstado(s.id, 'pagado')
      setServicios(prev => prev.map(x => x.id === s.id ? updated : x))
    } catch (error) {
      console.error('Error al marcar como pagado:', error)
      // Aquí podrías mostrar una notificación de error
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
  }

  // Verificar si un servicio está vencido
  const isOverdue = (vencimiento: string) => {
    const today = new Date()
    const dueDate = new Date(vencimiento)
    return dueDate < today
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Cargando servicios...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
            <p className="text-gray-600 mt-1">
              Organiza y gestiona tus servicios
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nuevo Servicio
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Por Pagar</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {grouped.por_pagar.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Pagados</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {grouped.pagado.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Vencidos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {grouped.vencido.length}
            </div>
          </div>
        </div>

        {/* Tablero Kanban */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(['por_pagar', 'pagado', 'vencido'] as ColumnKey[]).map(columnId => (
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-lg border-2 border-dashed p-4 min-h-[400px] transition-colors ${snapshot.isDraggingOver
                          ? 'border-blue-400 bg-blue-50'
                          : columnColors[columnId]
                        }`}
                    >
                      <h3 className="font-semibold text-lg mb-4 text-gray-800">
                        {columnTitles[columnId]} ({grouped[columnId].length})
                      </h3>

                      <div className="space-y-3">
                        {grouped[columnId].map((servicio, index) => (
                          <Draggable
                            draggableId={String(servicio.id)}
                            index={index}
                            key={servicio.id}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${dragSnapshot.isDragging
                                    ? 'shadow-lg rotate-2 scale-105'
                                    : 'hover:shadow-md'
                                  }`}
                              >
                                {/* Nombre del servicio */}
                                <div className="font-semibold text-gray-900 mb-2">
                                  {servicio.nombre}
                                </div>

                                {/* Monto */}
                                <div className="text-lg font-bold text-blue-600 mb-2">
                                  ${Number(servicio.monto).toLocaleString()}
                                </div>

                                {/* Fecha de vencimiento */}
                                <div className={`text-sm mb-3 ${isOverdue(servicio.vencimiento) && servicio.estado !== 'pagado'
                                    ? 'text-red-600 font-medium'
                                    : 'text-gray-600'
                                  }`}>
                                  Vence: {formatDate(servicio.vencimiento)}
                                </div>

                                {/* Periodicidad */}
                                <div className="text-xs text-gray-500 mb-3">
                                  {servicio.periodicidad === 'mensual' ? 'Mensual' : 'Único'}
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-2">
                                  {servicio.estado !== 'pagado' && (
                                    <button
                                      onClick={() => onPay(servicio)}
                                      className="flex-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    >
                                      Marcar como Pagado
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onDelete(servicio.id)}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Mensaje cuando la columna está vacía */}
                        {grouped[columnId].length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <div className="text-sm">No hay servicios {columnTitles[columnId].toLowerCase()}</div>
                            {columnId === 'por_pagar' && (
                              <div className="text-xs mt-1">
                                Arrastra servicios aquí o crea uno nuevo
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Modal para crear nuevo servicio */}
      {modalOpen && (
        <ServiceForm
          onClose={() => setModalOpen(false)}
          onCreated={(newServicio) => {
            setServicios(prev => [newServicio, ...prev])
            setModalOpen(false)
          }}
        />
      )}
    </Layout>
  )
}
