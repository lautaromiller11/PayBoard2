import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ResumenFinanciero } from '../lib/api'

interface FinancialChartProps {
  resumen: ResumenFinanciero
  mes: number
  año: number
}

export default function FinancialChart({ resumen, mes, año }: FinancialChartProps) {

  // Datos para el gráfico de barras (comparación general)
  const datosComparacion = [
    {
      name: 'Ingresos',
      monto: resumen.totales.ingresos,
      color: '#10B981'
    },
    {
      name: 'Gastos',
      monto: resumen.totales.gastos,
      color: '#EF4444'
    }
  ]

  // Datos para el gráfico de barras por categoría
  const datosPorCategoria = Object.entries(resumen.porCategoria).map(([categoria, datos]) => ({
    categoria,
    ingresos: datos.ingresos,
    gastos: datos.gastos,
    total: datos.ingresos + datos.gastos
  })).filter(item => item.total > 0)

  // Datos para gráfico circular de gastos por categoría
  const gastosCategoria = Object.entries(resumen.porCategoria)
    .filter(([, datos]) => datos.gastos > 0)
    .map(([categoria, datos]) => ({
      name: categoria,
      value: datos.gastos
    }))

  // Colores para el gráfico circular
  const COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#10B981']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value)
  }

  const nombreMes = new Date(año, mes - 1).toLocaleDateString('es-ES', { month: 'long' })

  return (
    <div className="space-y-6">
      {/* Título */}
      {/* Título eliminado */}

      {/* Gráfico de comparación general */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Ingresos vs Gastos</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosComparacion} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="monto">
              {datosComparacion.map((item, idx) => (
                <Cell key={`cell-${idx}`} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos por categoría */}
      {datosPorCategoria.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de barras por categoría */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Por Categoría</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorCategoria} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoria"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" />
                <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico circular de gastos */}
          {gastosCategoria.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Distribución de Gastos</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gastosCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gastosCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Resumen textual eliminado, solo se muestra el gráfico */}
    </div>
  )
}
