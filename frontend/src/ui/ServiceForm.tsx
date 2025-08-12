import { useEffect, useRef, useState } from 'react'
import { createServicio, Servicio } from '../lib/api'
import DEFAULT_CATEGORIES, { EXPENSE_CATEGORIES } from '../lib/categories'

import { updateServicio } from '../lib/api'

type Props = {
  onClose: () => void
  onCreated: (s: Servicio) => void
  servicio?: Servicio
  isEdit?: boolean
}

export default function ServiceForm({ onClose, onCreated, servicio, isEdit }: Props) {
  const [nombre, setNombre] = useState(servicio?.nombre || '')
  const [monto, setMonto] = useState(servicio?.monto?.toString() || '')
  const [vencimiento, setVencimiento] = useState(servicio?.vencimiento ? servicio.vencimiento.slice(0, 10) : '')
  const [periodicidad, setPeriodicidad] = useState<'unico' | 'mensual'>(servicio?.periodicidad || 'mensual')
  const [linkPago, setLinkPago] = useState(servicio?.linkPago || '')
  const [categoria, setCategoria] = useState(servicio?.categoria || EXPENSE_CATEGORIES[0] || DEFAULT_CATEGORIES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCatOpen, setIsCatOpen] = useState(false)
  const catDropdownRef = useRef<HTMLDivElement | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let result: Servicio;
      if (isEdit && servicio) {
        result = await updateServicio(servicio.id, {
          nombre,
          monto,
          vencimiento,
          periodicidad,
          linkPago: linkPago || undefined,
          categoria
        });
      } else {
        result = await createServicio({
          nombre,
          monto,
          vencimiento,
          periodicidad,
          estado: 'por_pagar',
          linkPago: linkPago || undefined,
          categoria
        });
      }
      onCreated(result)
      onClose()
    } catch (err) {
      setError(isEdit ? 'Error al editar el servicio.' : 'Error al crear el servicio. Por favor intenta nuevamente.')
      console.error(isEdit ? 'Error editing service:' : 'Error creating service:', err)
    } finally {
      setLoading(false)
    }
  }

  // Establecer fecha mínima como hoy
  const today = new Date().toISOString().split('T')[0]

  // Cerrar dropdown en click afuera o ESC
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!catDropdownRef.current) return
      if (!catDropdownRef.current.contains(e.target as Node)) {
        setIsCatOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCatOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-purple-300">{isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Servicio *
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Electricidad, Internet, Netflix..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Vencimiento *
            </label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendar-input"
                value={vencimiento}
                onChange={e => setVencimiento(e.target.value)}
                type="date"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Periodicidad
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={periodicidad}
              onChange={e => setPeriodicidad(e.target.value as any)}
            >
              <option value="mensual">Mensual</option>
              <option value="unico">Único</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {periodicidad === 'mensual'
                ? 'Se repetirá cada mes'
                : 'Pago único, no se repetirá'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <div className="relative" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCatOpen((v) => !v)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={isCatOpen}
              >
                <span className={categoria ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                  {categoria || 'Seleccionar categoría'}
                </span>
                <span className={`ml-2 transform transition-transform ${isCatOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {isCatOpen && (
                <div
                  role="listbox"
                  className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      role="option"
                      aria-selected={categoria === cat}
                      onClick={() => {
                        setCategoria(cat)
                        setIsCatOpen(false)
                      }}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-dark-bg-accent ${categoria === cat ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'}`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link de Pago (URL)
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={linkPago}
              onChange={e => setLinkPago(e.target.value)}
              type="url"
              placeholder="https://..."
              pattern="https?://.+"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-dark-bg-accent rounded-lg hover:bg-gray-200 dark:hover:bg-dark-bg-hover transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


