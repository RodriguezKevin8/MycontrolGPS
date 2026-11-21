import React, { useState } from 'react'
import { MapPin, Lock, User, ArrowRight } from 'lucide-react'
import api from '../services/api'
import { Usuario } from '../types'

interface LoginPageProps {
  onLoginSuccess: (user: Usuario) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/login', { usuario, password })
      localStorage.setItem('auth_token', response.data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      onLoginSuccess(response.data.user)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // const handleQuickLogin = (userType: 'admin' | 'director') => {
  //   if (userType === 'admin') {
  //     setUsuario('admin')
  //     setPassword('admin123')
  //   } else {
  //     setUsuario('director1')
  //     setPassword('admin123')
  //   }
  // }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-100 mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MycontrolGPS</h1>
          <p className="text-sm text-slate-500 mt-1">Plataforma de Gestión Escolar y Geolocalización</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej. admin o director1"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Credenciales de Prueba (Demo)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-center"
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('director')}
              className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-center"
            >
              Escuela 1
            </button>
          </div>
        </div> */}
      </div>
    </div>
  )
}

