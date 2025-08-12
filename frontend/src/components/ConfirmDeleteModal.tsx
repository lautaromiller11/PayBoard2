import React from 'react'

interface ConfirmDeleteModalProps {
    open: boolean
    title?: string
    description?: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDeleteModal({ open, title, description, onConfirm, onCancel }: ConfirmDeleteModalProps) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-6 w-full max-w-sm border dark:border-dark-600">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title || '¿Eliminar elemento?'}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{description || 'Esta acción no se puede deshacer. ¿Deseas continuar?'}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-dark-bg-accent text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-dark-bg-hover font-medium"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
                        onClick={onConfirm}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    )
}
