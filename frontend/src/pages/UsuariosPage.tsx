import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Shield, User as UserIcon, Lock, CheckCircle2, AlertCircle, School as SchoolIcon } from 'lucide-react'
import Card from '../components/common/Card'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { Usuario } from '../types'

interface UsuariosPageProps {
  user: Usuario | null
}

export default function UsuariosPage({ user }: UsuariosPageProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(false)

  // Form State
  const [nombre, setNombre] = useState('')
  const [usuarioName, setUsuarioName] = useState('')
  const [password, setPassword] = useState('')
  const [tipo, setTipo] = useState<'Administrador' | 'Usuario'>('Usuario')

  const loadUsuarios = () => {
    api.get<Usuario[]>('/usuarios')
      .then((res) => setUsuarios(res.data))
      .catch((err) => {
        console.error('Error cargando usuarios:', err)
      })
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const handleOpenCreate = () => {
    setEditingUser(null)
    setNombre('')
    setUsuarioName('')
    setPassword('')
    setTipo('Usuario')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (u: Usuario) => {
    setEditingUser(u)
    setNombre(u.nombre)
    setUsuarioName(u.usuario)
    setPassword('') // Dejar vacío para no sobreescribir salvo que escriba uno nuevo
    setTipo(u.tipo)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: any = {
      nombre,
      usuario: usuarioName.trim().toLowerCase(),
      tipo,
    }

    if (password) {
      payload.password = password
    }

    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id_user}`, payload)
      } else {
        if (!password) {
          alert('Debes ingresar una contraseña para el nuevo usuario')
          setLoading(false)
          return
        }
        await api.post('/usuarios', payload)
      }
      setIsModalOpen(false)
      loadUsuarios()
    } catch (err: any) {
      const serverMessage = err.response?.data?.message
      const errors = err.response?.data?.errors
      const detailed = errors ? Object.values(errors).flat().join('\n') : serverMessage
      alert(detailed || 'Error al procesar el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (u: Usuario) => {
    if (u.id_user === user?.id_user) {
      alert('No puedes eliminar tu propia cuenta en sesión activa')
      return
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario "${u.nombre}" (@${u.usuario})?`)) return

    try {
      await api.delete(`/usuarios/${u.id_user}`)
      loadUsuarios()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administración de cuentas de acceso, roles del sistema y vinculación institucional
          </p>
        </div>

        {user?.tipo === 'Administrador' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Nombre de Acceso</th>
                <th className="py-3 px-4">Rol / Nivel</th>
                <th className="py-3 px-4">Sede Asociada</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {usuarios.map((u) => {
                const isCurrent = u.id_user === user?.id_user
                return (
                  <tr key={u.id_user} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          u.tipo === 'Administrador'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 leading-tight">{u.nombre}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">ID: #{u.id_user}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
                        @{u.usuario}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.tipo === 'Administrador' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          <Shield className="w-3.5 h-3.5" />
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                          Usuario Regular
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.school ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                          <SchoolIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[200px]">{u.school.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {u.tipo === 'Administrador' ? 'Acceso global (todas)' : 'Sin sede asignada'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isCurrent}
                        className={`p-1.5 rounded-lg transition ${
                          isCurrent
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={isCurrent ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Lic. Carlos Morales"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre de Usuario (Login)</label>
              <input
                type="text"
                required
                value={usuarioName}
                onChange={(e) => setUsuarioName(e.target.value)}
                placeholder="ej. cmorales"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Usado para iniciar sesión</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                {editingUser ? 'Contraseña (Opcional)' : 'Contraseña'}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? 'Dejar en blanco para conservar' : 'Mínimo 6 caracteres'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {editingUser ? 'Solo ingresa valor si deseas cambiarla' : 'Mínimo 6 caracteres'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Rol / Tipo de Cuenta</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'Administrador' | 'Usuario')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            >
              <option value="Usuario">Usuario Regular (Director / Encargado de Sede)</option>
              <option value="Administrador">Administrador del Sistema (Control Total)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              {tipo === 'Administrador'
                ? 'Los Administradores pueden gestionar todas las escuelas, usuarios, alumnos y consultar todos los reportes consolidados.'
                : 'Los Usuarios regulares solo pueden visualizar y administrar la sede escolar que se les asigne desde el módulo de Escuelas.'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
