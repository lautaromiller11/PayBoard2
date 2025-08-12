import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useEffect, useMemo, useState } from 'react'
import { useSync } from '../context/SyncContext'
import { changeEstado, createPago, deleteServicio, fetchServicios, Servicio } from '../lib/api'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import ServiceForm from '../ui/ServiceForm'
import Layout from '../components/Layout'
import { FaCalendarAlt } from 'react-icons/fa'

type ColumnKey = 'por_pagar' | 'pagado' | 'vencido'

const columnTitles: Record<ColumnKey, string> = {
  por_pagar: 'Por Pagar',
  pagado: 'Pagado',
  vencido: 'Vencido'
}

const columnColors: Record<ColumnKey, string> = {
  por_pagar: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50',
  pagado: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50',
  vencido: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
}

export default function Servicios() {
  const { triggerFinanzasSync } = useSync();
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editServicio, setEditServicio] = useState<Servicio | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Agrupar servicios por columna (estado) y reordenar columnas: Por pagar, Vencido, Pagado
  const grouped = useMemo(() => {
    const base: Record<ColumnKey, Servicio[]> = {
      por_pagar: [],
      vencido: [],
      pagado: []
    };
    if (!Array.isArray(servicios)) return base;
    servicios.forEach(s => {
      const key = (s.estado as ColumnKey) || 'por_pagar';
      if (!base[key]) base[key] = [];
      base[key].push(s);
    });
    // ordenar por fecha de vencimiento ascendente
    (['por_pagar', 'vencido', 'pagado'] as ColumnKey[]).forEach(k => {
      base[k].sort((a, b) => {
        const da = new Date(a.vencimiento).getTime();
        const db = new Date(b.vencimiento).getTime();
        return da - db;
      });
    });
    return base;
  }, [servicios]);

  // Cargar servicios (debe estar definido antes del useEffect)
  const loadServicios = async () => {
    try {
      setLoading(true)
      const [año, mes] = mesSeleccionado.split('-').map(Number)
      const data = await fetchServicios(mes, año)
      setServicios(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  // Extraer año/mes para dependencias (se calculan a partir de mesSeleccionado)
  const [año, mes] = mesSeleccionado.split('-').map(Number)

  // Cargar servicios al montar y cuando cambia el mes
  useEffect(() => {
    loadServicios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, año, mesSeleccionado])

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
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      // Aquí podrías mostrar una notificación de error
    }
  }

  // Eliminar servicio
  const onDelete = async (id: number) => {
    try {
      await deleteServicio(id)
      setServicios(prev => prev.filter(s => s.id !== id))
      triggerFinanzasSync();
    } catch (err) {
      console.error('Error al eliminar servicio:', err)
      // Aquí podrías mostrar una notificación de error
    }
  }

  // Marcar servicio como pagado y abrir link de pago si existe
  const onPayClick = async (s: Servicio) => {
    try {
      if (s.linkPago) {
        window.open(s.linkPago, '_blank', 'noopener,noreferrer')
      }
      const today = new Date().toISOString()
      await createPago({ servicioId: s.id, fechaPago: today, montoPagado: s.monto })
      const updated = await changeEstado(s.id, 'pagado')
      setServicios(prev => prev.map(x => x.id === s.id ? updated : x))
      triggerFinanzasSync();
    } catch (err) {
      console.error('Error al pagar servicio:', err)
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('es-ES')
  }

  // El estado vencido lo decide el backend. No marcar localmente.

  // Handlers del modal de borrado (solo una definición, ya no duplicadas)
  function handleDeleteClick(id: number) {
    setDeleteId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return
    try {
      await deleteServicio(deleteId)
      setServicios(prev => prev.filter(s => s.id !== deleteId))
    } catch (err) {
      console.error('Error al eliminar servicio:', err)
    } finally {
      setDeleteModalOpen(false)
      setDeleteId(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setDeleteId(null)
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Cargando servicios...</div>
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
            <div className="text-lg text-red-600 dark:text-red-500">{error}</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header - Responsive, mobile friendly */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Gestión de Servicios</h1>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">Organiza y gestiona tus servicios</p>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            {/* Calendario con icono, abre modal visual */}
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-bg-accent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ml-2 sm:ml-0"
              onClick={() => setCalendarOpen(true)}
              aria-label="Seleccionar mes"
            >
              <FaCalendarAlt size={18} />
              <span className="hidden sm:inline">Mes</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 sm:flex-none px-2 sm:px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap max-w-[140px] sm:max-w-none"
              style={{ minWidth: 'unset' }}
            >
              + Servicio
            </button>
            {/* Modal calendario */}
            {calendarOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-6 w-80 max-w-full flex flex-col items-center">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Selecciona el mes</h2>
                  <input
                    type="month"
                    value={mesSeleccionado}
                    onChange={e => {
                      setMesSeleccionado(e.target.value);
                      setCalendarOpen(false);
                    }}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 w-full"
                  />
                  <button
                    onClick={() => setCalendarOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-bg-accent text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-dark-bg-hover transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tablero Kanban - Responsive */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm border dark:border-dark-600 p-3 sm:p-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(['por_pagar', 'vencido', 'pagado'] as ColumnKey[]).map(columnId => (
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-lg border-2 border-dashed p-4 min-h-[400px] transition-colors ${snapshot.isDraggingOver
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700/50'
                        : columnColors[columnId]
                        }`}
                    >
                      <h3 className="font-semibold text-base sm:text-lg mb-4 text-gray-600 dark:text-gray-300">
                        {columnTitles[columnId]} <span className="font-normal text-gray-500 dark:text-gray-400">({grouped[columnId]?.length ?? 0})</span>
                      </h3>

                      <div className="space-y-3 custom-scrollbar max-h-[calc(80vh-6rem)] overflow-y-auto pr-1.5">
                        {grouped[columnId]?.map((servicio, index) => (
                          <Draggable
                            draggableId={String(servicio.id)}
                            index={index}
                            key={servicio.id}
                          >
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className="p-3 sm:p-4 rounded-lg bg-white dark:bg-dark-bg-secondary border dark:border-dark-600 shadow-sm hover:shadow transition-shadow"
                              >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white text-base sm:text-lg">{servicio.nombre}</div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Vence: {formatDate(servicio.vencimiento)}</div>
                                    {servicio.estado === 'vencido' && (
                                      <div className="mt-1 inline-block text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                                        Vencido
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">${Number(servicio.monto).toLocaleString('es-AR')}</div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                                  {servicio.estado !== 'pagado' && (
                                    <button
                                      onClick={() => onPayClick(servicio)}
                                      className="px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      Pagar
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(servicio.id)}
                                    className="px-3 py-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
                                  >
                                    Eliminar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setEditServicio(servicio); setEditModalOpen(true); }}
                                    className="px-3 py-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"
                                  >
                                    Editar
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>

        {deleteModalOpen && (
          <ConfirmDeleteModal
            open={deleteModalOpen}
            title="¿Está seguro que desea eliminar el servicio?"
            description="Esta acción no se puede deshacer."
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}
        {modalOpen && (
          <ServiceForm
            onClose={() => setModalOpen(false)}
            onCreated={(s) => {
              setServicios(prev => [s, ...prev])
              setModalOpen(false)
              triggerFinanzasSync();
            }}
          />
        )}
        {editModalOpen && editServicio && (
          <ServiceForm
            servicio={editServicio}
            onClose={() => { setEditModalOpen(false); setEditServicio(null); }}
            onCreated={(s) => {
              setServicios(prev => prev.map(x => x.id === s.id ? s : x));
              setEditModalOpen(false);
              setEditServicio(null);
              triggerFinanzasSync();
            }}
            isEdit={true}
          />
        )}
      </div>
    </Layout>
  )
}
