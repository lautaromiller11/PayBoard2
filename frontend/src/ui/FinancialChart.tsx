import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ResumenFinanciero } from '../lib/api'
import { useTheme } from '../context/ThemeContext'
import { useEffect, useState } from 'react'

interface FinancialChartProps {
  resumen: ResumenFinanciero
  mes: number
  año: number
}

export default function FinancialChart({ resumen, mes, año }: FinancialChartProps) {
  const { theme } = useTheme()
  const [gridColor, setGridColor] = useState('#e5e7eb')
  const [textColor, setTextColor] = useState('#111827')

  // Actualiza colores cuando cambia el tema
  useEffect(() => {
    if (theme === 'dark') {
      setGridColor('#4b5563')
      setTextColor('#d1d5db')
    } else {
      setGridColor('#e5e7eb')
      setTextColor('#111827')
    }
  }, [theme])

  // Estilos del tooltip para modo oscuro/claro
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e1e2e' : '#fff',
    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: '0.375rem',
    padding: '0.625rem',
    color: textColor,
    boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const tooltipItemStyle = {
    color: textColor,
    padding: '0.25rem 0',
    fontSize: '0.875rem'
  };

  const tooltipLabelStyle = {
    color: theme === 'dark' ? '#a5b4fc' : '#3b82f6',
    fontWeight: 600,
    marginBottom: '0.25rem',
    fontSize: '0.9375rem'
  };

  // Custom label renderer for pie chart
  const renderCustomizedPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    const displayName = name.length > 10 && window.innerWidth < 640 ? name.slice(0, 8) + '…' : name;
    return (
      <text x={x} y={y} fill={textColor} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${displayName} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
      <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-sm border dark:border-dark-600">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Ingresos vs Gastos</h4>
        <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 220 : 300}>
          <BarChart data={datosComparacion} margin={{ top: 20, right: window.innerWidth < 640 ? 10 : 30, left: window.innerWidth < 640 ? 10 : 20, bottom: window.innerWidth < 640 ? 40 : 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: window.innerWidth < 640 ? 12 : 14, fill: textColor }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: window.innerWidth < 640 ? 12 : 14, fill: textColor }} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
            />
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
          <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-sm border dark:border-dark-600">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Por Categoría</h4>
            <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 220 : 300}>
              <BarChart data={datosPorCategoria} margin={{ top: 20, right: window.innerWidth < 640 ? 10 : 30, left: window.innerWidth < 640 ? 10 : 20, bottom: window.innerWidth < 640 ? 60 : 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="categoria"
                  angle={window.innerWidth < 640 ? -30 : -45}
                  textAnchor="end"
                  height={window.innerWidth < 640 ? 60 : 80}
                  tick={{ fontSize: window.innerWidth < 640 ? 11 : 14, fill: textColor }}
                />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: window.innerWidth < 640 ? 12 : 14, fill: textColor }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" />
                <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico circular de gastos */}
          {gastosCategoria.length > 0 && (
            <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-sm border dark:border-dark-600">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Distribución de Gastos</h4>
              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 220 : 300}>
                <PieChart>
                  <Pie
                    data={gastosCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomizedPieLabel}
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gastosCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={tooltipStyle}
                    itemStyle={tooltipItemStyle}
                    labelStyle={tooltipLabelStyle}
                  />
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
