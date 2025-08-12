import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Servicios from './pages/Servicios'
import FinanzasPersonales from './pages/FinanzasPersonales'
import Cotizaciones from './pages/Cotizaciones'
import Home from './pages/Home'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SyncProvider } from './context/SyncContext'
import { ThemeProvider } from './context/ThemeContext'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <ThemeProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas privadas */}
            <Route
              path="/servicios"
              element={
                <PrivateRoute>
                  <Servicios />
                </PrivateRoute>
              }
            />
            <Route
              path="/finanzas"
              element={
                <PrivateRoute>
                  <FinanzasPersonales />
                </PrivateRoute>
              }
            />
            <Route
              path="/cotizaciones"
              element={
                <PrivateRoute>
                  <Cotizaciones />
                </PrivateRoute>
              }
            />

            {/* Redirecciones */}
            <Route path="/dashboard" element={<Navigate to="/servicios" replace />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/servicios" replace />} />
          </Routes>
        </ThemeProvider>
      </SyncProvider>
    </AuthProvider>
  )
}


