import { Transaccion, deleteTransaccion } from '../lib/api'

interface TransactionListProps {
  transacciones: Transaccion[]
  onTransaccionDeleted: (id: number) => void
  loading?: boolean
}

export default function TransactionList({ transacciones, onTransaccionDeleted, loading = false }: TransactionListProps) {
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return
    }

    try {
      await deleteTransaccion(id)
      onTransaccionDeleted(id)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      // Aquí podrías mostrar una notificación de error
    }
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'ingreso' ? '↗️' : '↙️'
  }

  const getTipoColor = (tipo: string) => {
    return tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Transacciones</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg mb-2">Cargando transacciones...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Transacciones ({transacciones.length})
        </h2>
      </div>
      
      <div className="divide-y max-h-96 overflow-y-auto">
        {transacciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-lg mb-2">No hay transacciones</div>
            <div className="text-sm">Agrega tu primera transacción para comenzar</div>
          </div>
        ) : (
          transacciones.map((transaccion) => (
            <div key={transaccion.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Icono de tipo */}
                  <div className="text-xl">
                    {getTipoIcon(transaccion.tipo)}
                  </div>
                  
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {transaccion.descripcion}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{transaccion.categoria}</span>
                      <span>•</span>
                      <span>{formatDate(transaccion.fecha)}</span>
                      {transaccion.periodicidad === 'mensual' && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                            {transaccion.esRecurrente ? 'Recurrente' : 'Mensual'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Monto y acciones */}
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-semibold ${getTipoColor(transaccion.tipo)}`}>
                    {transaccion.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(transaccion.monto)}
                  </div>
                  
                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleDelete(transaccion.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Eliminar transacción"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
