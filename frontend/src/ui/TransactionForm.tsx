import { useState, useEffect, useRef } from 'react'
import { createTransaccion, fetchCategoriasPorTipo, Transaccion } from '../lib/api'
import DEFAULT_CATEGORIES, { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../lib/categories'

interface TransactionFormProps {
  tipo: 'ingreso' | 'gasto'
  onClose: () => void
  onCreated: (transaccion: Transaccion) => void
}

export default function TransactionForm({ tipo, onClose, onCreated }: TransactionFormProps) {
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState('')
  const [periodicidad, setPeriodicidad] = useState<'unico' | 'mensual'>('unico')
  const initialCats = tipo === 'ingreso' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const [categorias, setCategorias] = useState<string[]>(initialCats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCatOpen, setIsCatOpen] = useState(false)
  const catDropdownRef = useRef<HTMLDivElement | null>(null)

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        // Intentar tomar desde API; si falla, usar lista local
        const data = await fetchCategoriasPorTipo(tipo)
        if (Array.isArray(data) && data.length > 0) {
          // Si la API retorna un set único, se usa tal cual; si en el futuro separa por tipo,
          // aquí se podría filtrar según 'tipo'. Por ahora mantenemos el comportamiento previo.
          setCategorias(data)
        }
      } catch (err) {
        console.error('Error loading categorias:', err)
        // En error mantenemos las categorías locales
      }
      // Establecer selección por defecto
      const fallbackFirst = (initialCats[0] ?? DEFAULT_CATEGORIES[0])
      setCategoria((prev) => prev || (categorias[0] ?? fallbackFirst))
    }

    loadCategorias()

    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0]
    setFecha(today)
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const transaccion = await createTransaccion({
        tipo,
        monto: parseFloat(monto),
        descripcion,
        categoria,
        fecha,
        periodicidad
      })

      onCreated(transaccion)
      onClose()
    } catch (err) {
      console.error('Error creating transaction:', err)
      setError('Error al crear la transacción. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const getTipoColor = () => {
    return tipo === 'ingreso' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
  }

  const getBtnColor = () => {
    return tipo === 'ingreso'
      ? 'bg-green-600 hover:bg-green-700'
      : 'bg-red-600 hover:bg-red-700'
  }

  const getTipoLabel = () => {
    return tipo === 'ingreso' ? 'Ingreso' : 'Gasto'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${getTipoColor()}`}>
            Nuevo {getTipoLabel()}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción *
            </label>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder={`Ej: ${tipo === 'ingreso' ? 'Salario mensual, Freelance' : 'Compras, Electricidad'}`}
              required
            />
          </div>

          {/* Monto */}
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

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría *
            </label>
            <div className="relative" ref={catDropdownRef}>
              {/* Hidden input to keep required validation semantics */}
              <input type="text" className="hidden" value={categoria} onChange={() => { }} required readOnly />
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
                  className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {categorias.map((cat) => (
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

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              type="date"
              required
            />
          </div>

          {/* Periodicidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Periodicidad
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-input text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={periodicidad}
              onChange={e => setPeriodicidad(e.target.value as 'unico' | 'mensual')}
            >
              <option value="unico">Único</option>
              <option value="mensual">Mensual</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {periodicidad === 'mensual'
                ? 'Se repetirá automáticamente cada mes'
                : 'Solo se registrará una vez'
              }
            </p>
          </div>

          {/* Botones */}
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
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getBtnColor()}`}
            >
              {loading ? 'Guardando...' : `Crear ${getTipoLabel()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
