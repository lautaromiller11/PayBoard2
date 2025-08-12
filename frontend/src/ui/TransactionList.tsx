import { Transaccion, deleteTransaccion } from '../lib/api'
import React, { useState } from 'react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

interface TransactionListProps {
  transacciones: Transaccion[]
  onTransaccionDeleted: (id: number) => void
  loading?: boolean
}

export default function TransactionList({ transacciones, onTransaccionDeleted, loading = false }: TransactionListProps) {

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function handleDeleteClick(id: number) {
    setDeleteId(id);
    setDeleteModalOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      await deleteTransaccion(deleteId);
      onTransaccionDeleted(deleteId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

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
    if (tipo === 'ingreso') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    } else {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M12 19l-6-6M12 19l6-6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  }

  const getTipoColor = (tipo: string) => {
    return tipo === 'ingreso' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border dark:border-dark-600 transition-colors">
        <div className="p-6 border-b dark:border-dark-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transacciones</h2>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg mb-2">Cargando transacciones...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border dark:border-dark-600 transition-colors">
      <div className="p-6 border-b dark:border-dark-600">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Transacciones ({transacciones.length})
        </h2>
      </div>

      <div className="divide-y dark:divide-dark-600 max-h-96 overflow-y-auto custom-scrollbar">
        {transacciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-lg mb-2">No hay transacciones</div>
            <div className="text-sm">Agrega tu primera transacción para comenzar</div>
          </div>
        ) : (
          transacciones.map((transaccion) => (
            <div key={transaccion.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-accent transition-colors">
              <div className="flex flex-row items-start justify-between gap-2 w-full">
                {/* Izquierda: icono, nombre y textos descriptivos */}
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="text-xl flex-shrink-0 mt-1">{getTipoIcon(transaccion.tipo)}</div>
                  <div className="flex flex-col min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-base sm:text-lg truncate">
                      {transaccion.descripcion}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-row flex-wrap items-center gap-1 sm:gap-2">
                      <span className="truncate max-w-[90px] sm:max-w-none">{transaccion.categoria}</span>
                      <span>•</span>
                      <span>{formatDate(transaccion.fecha)}</span>
                      {transaccion.periodicidad === 'mensual' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded w-fit">
                          {transaccion.esRecurrente ? 'Recurrente' : 'Mensual'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Derecha: monto y borrar */}
                <div className="flex flex-row items-center gap-4 flex-shrink-0 min-w-[70px]">
                  <div className={`text-base sm:text-lg font-semibold ${getTipoColor(transaccion.tipo)} break-words text-right`}>
                    {transaccion.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(transaccion.monto)}
                  </div>
                  <button
                    onClick={() => handleDeleteClick(transaccion.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors p-1 flex-shrink-0"
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
      {deleteModalOpen && (
        <ConfirmDeleteModal
          open={deleteModalOpen}
          title="¿Está seguro que desea eliminar la transacción?"
          description="Esta acción no se puede deshacer."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  )
}
