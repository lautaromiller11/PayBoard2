import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar } from 'recharts'
import { Servicio } from '../lib/api'

const COLORS = ['#2563eb', '#22c55e', '#f97316', '#a3a3a3']

export default function FinancePanel({ servicios }: { servicios: Servicio[] }) {
  // Simplified finance summary: ingresos = suma pagados; egresos = suma por pagar + vencidos
  const ingresos = servicios.filter(s => s.estado === 'pagado').reduce((a, b) => a + Number(b.monto), 0)
  const egresos = servicios.filter(s => s.estado !== 'pagado').reduce((a, b) => a + Number(b.monto), 0)

  const pieData = [
    { name: 'Vivienda', value: Math.round(ingresos * 0.4) },
    { name: 'Transporte', value: Math.round(ingresos * 0.2) },
    { name: 'Suscripciones', value: Math.round(ingresos * 0.3) },
    { name: 'Otros', value: Math.max(ingresos - Math.round(ingresos * 0.9), 0) }
  ]

  const barData = [
    { name: 'Abr', ingresos: ingresos * 0.3, egresos: egresos * 0.2 },
    { name: 'May', ingresos: ingresos * 0.5, egresos: egresos * 0.3 },
    { name: 'Jun', ingresos: ingresos * 0.7, egresos: egresos * 0.4 },
    { name: 'Jul', ingresos: ingresos * 1.0, egresos: egresos * 0.5 }
  ]

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow dark:shadow-lg p-4 transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Finanzas personales</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600 dark:text-gray-400">Ingresos</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">${ingresos.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Egresos</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">${egresos.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Balance</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">${(ingresos - egresos).toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={pieData} outerRadius={80}>
                {pieData.map((_, index) => (
                  <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)", borderColor: "var(--color-border)" }} />
              <Legend />
              <Bar dataKey="ingresos" fill="#2563eb" />
              <Bar dataKey="egresos" fill="#d1d5db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


