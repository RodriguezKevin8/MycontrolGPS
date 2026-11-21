import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EscuelasPage from './pages/EscuelasPage'
import AlumnosPage from './pages/AlumnosPage'
import PadresPage from './pages/PadresPage'
import ReportesPage from './pages/ReportesPage'
import UsuariosPage from './pages/UsuariosPage'
import api from './services/api'
import { Usuario, School } from './types'

export default function App() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [activeSchool, setActiveSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get<{ user: Usuario }>('/me')
        .then((res) => {
          setUser(res.data.user)
          if (res.data.user.school) {
            setActiveSchool(res.data.user.school)
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token')
          delete api.defaults.headers.common['Authorization']
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLoginSuccess = (userData: Usuario) => {
    setUser(userData)
    if (userData.school) {
      setActiveSchool(userData.school)
    }
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (e) {
      // Ignorar error si ya caducó
    } finally {
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm">
        Cargando sistema MycontrolGPS...
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          school={activeSchool}
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  user={user}
                  onSchoolChange={(sch) => setActiveSchool(sch)}
                />
              }
            />
            <Route
              path="/escuelas"
              element={
                <EscuelasPage
                  user={user}
                  onSchoolUpdated={() => {
                    api.get<{ user: Usuario }>('/me').then((r) => {
                      if (r.data.user.school) setActiveSchool(r.data.user.school)
                    })
                  }}
                />
              }
            />
            <Route path="/alumnos" element={<AlumnosPage user={user} />} />
            <Route path="/padres" element={<PadresPage user={user} />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route
              path="/usuarios"
              element={
                user?.tipo === 'Administrador' ? (
                  <UsuariosPage user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

