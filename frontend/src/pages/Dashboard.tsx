import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useEffect, useMemo, useState } from 'react'
import { changeEstado, createPago, deleteServicio, fetchServicios, Servicio } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import ServiceForm from '../ui/ServiceForm'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import FinancePanel from '../ui/FinancePanel'

type ColumnKey = 'por_pagar' | 'pagado' | 'vencido'

export default function Dashboard() {
  const { logout, user } = useAuth()
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const grouped = useMemo(() => ({
    por_pagar: servicios.filter(s => s.estado === 'por_pagar'),
    pagado: servicios.filter(s => s.estado === 'pagado'),
    vencido: servicios.filter(s => s.estado === 'vencido'),
  }), [servicios])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await fetchServicios()
        setServicios(data)
      } catch {
        setError('No se pudieron cargar los servicios')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

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
    } catch {
      // ignore
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeleteId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return
    await deleteServicio(deleteId)
    setServicios(prev => prev.filter(s => s.id !== deleteId))
    setDeleteModalOpen(false)
    setDeleteId(null)
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setDeleteId(null)
  }

  const onPay = async (s: Servicio) => {
    const today = new Date().toISOString()
    await createPago({ servicioId: s.id, fechaPago: today, montoPagado: s.monto })
    const updated = await changeEstado(s.id, 'pagado')
    setServicios(prev => prev.map(x => x.id === s.id ? updated : x))
  }

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-white dark:bg-dark-bg-primary transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Servicios</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
              <button onClick={() => setModalOpen(true)} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">Nuevo</button>
              <button onClick={logout} className="px-3 py-2 rounded bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors">Salir</button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          ) : error ? (
            <p className="text-red-600 dark:text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow dark:shadow-dark p-4 transition-colors">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['por_pagar', 'pagado', 'vencido'] as ColumnKey[]).map(col => (
                        <Droppable droppableId={col} key={col}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 dark:bg-dark-bg-accent rounded-lg p-3 min-h-[240px] max-h-[70vh] overflow-y-auto custom-scrollbar">
                              <h3 className="font-semibold mb-2 capitalize text-gray-700 dark:text-gray-300">{col.replace('_', ' ')}</h3>
                              {grouped[col].map((s, index) => (
                                <Draggable draggableId={String(s.id)} index={index} key={s.id}>
                                  {(dragProvided) => (
                                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} className="bg-white dark:bg-dark-bg-secondary border dark:border-dark-600 rounded-lg p-3 mb-3 shadow-sm transition-colors">
                                      <div className="font-semibold mb-1 text-gray-900 dark:text-white">{s.nombre}</div>
                                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">${Number(s.monto).toLocaleString()}</div>
                                      <div className="flex gap-2">
                                        {s.estado !== 'pagado' && (
                                          <button onClick={() => onPay(s)} className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">Pagar</button>
                                        )}
                                        <button onClick={() => handleDeleteClick(s.id)} className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors">Eliminar</button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </DragDropContext>
                </div>
              </div>
              <div>
                <FinancePanel servicios={servicios} />
              </div>
            </div>
          )}
        </div>

        {deleteModalOpen && (
          <ConfirmDeleteModal
            open={deleteModalOpen}
            title="¿Eliminar servicio?"
            description="Esta acción no se puede deshacer. ¿Deseas eliminar este servicio?"
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}
        {modalOpen && (
          <ServiceForm onClose={() => setModalOpen(false)} onCreated={(s) => setServicios(prev => [s, ...prev])} />
        )}
      </div>
    </Layout>
  )
}


