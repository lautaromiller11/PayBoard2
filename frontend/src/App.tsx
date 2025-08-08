import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Servicios from './pages/Servicios'
import FinanzasPersonales from './pages/FinanzasPersonales'
import { AuthProvider, useAuth } from './context/AuthContext'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
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
        
        {/* Redirecciones */}
        <Route path="/dashboard" element={<Navigate to="/servicios" replace />} />
        <Route path="/" element={<Navigate to="/servicios" replace />} />
        <Route path="*" element={<Navigate to="/servicios" replace />} />
      </Routes>
    </AuthProvider>
  )
}


