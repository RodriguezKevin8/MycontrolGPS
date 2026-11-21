import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Phone, Users, School as SchoolIcon } from 'lucide-react'
import Card from '../components/common/Card'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { Padre, Usuario, School } from '../types'

interface PadresPageProps {
  user: Usuario | null
}

export default function PadresPage({ user }: PadresPageProps) {
  const [padres, setPadres] = useState<Padre[]>([])
  const [schoolsList, setSchoolsList] = useState<School[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPadre, setEditingPadre] = useState<Padre | null>(null)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [idSchool, setIdSchool] = useState<string | number>('')
  const [loading, setLoading] = useState(false)

  const loadData = () => {
    api.get<Padre[]>('/padres').then((res) => setPadres(res.data))
    if (user?.tipo === 'Administrador') {
      api.get<School[]>('/schools').then((res) => setSchoolsList(res.data)).catch(() => {})
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingPadre(null)
    setNombre('')
    setDireccion('')
    setTelefono('')
    setIdSchool(schoolsList[0]?.Id_school || '')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: Padre) => {
    setEditingPadre(p)
    setNombre(p.nombre)
    setDireccion(p.direccion || '')
    setTelefono(p.telefono || '')
    setIdSchool(p.id_school || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: any = { nombre, direccion, telefono }
    if (user?.tipo === 'Administrador' && idSchool) {
      payload.id_school = Number(idSchool)
    }

    try {
      if (editingPadre) {
        await api.put(`/padres/${editingPadre.id_padre}`, payload)
      } else {
        await api.post('/padres', payload)
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el responsable')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Deseas eliminar este padre o tutor?')) return
    try {
      await api.delete(`/padres/${id}`)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Padres y Tutores</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.tipo === 'Administrador'
              ? 'Directorio global de contacto y responsables legales de todas las sedes'
              : `Directorio de responsables legales de ${user?.school?.nombre || 'tu institución'}`}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Responsable
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Nombre del Tutor</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Dirección</th>
                {user?.tipo === 'Administrador' && <th className="py-3 px-4">Sede Escolar</th>}
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {padres.map((p) => (
                <tr key={p.id_padre} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    {p.nombre}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {p.telefono || 'Sin teléfono'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">{p.direccion || 'Sin dirección'}</td>
                  
                  {user?.tipo === 'Administrador' && (
                    <td className="py-3.5 px-4">
                      {p.school ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <SchoolIcon className="w-3.5 h-3.5 text-indigo-600" />
                          {p.school.nombre}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">General</span>
                      )}
                    </td>
                  )}

                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_padre)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {padres.length === 0 && (
                <tr>
                  <td colSpan={user?.tipo === 'Administrador' ? 5 : 4} className="py-8 text-center text-sm text-slate-400">
                    No hay responsables registrados para esta sede educativa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPadre ? 'Editar Responsable' : 'Registrar Nuevo Responsable'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Carmen Flores"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="5551-2233"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle o colonia..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {user?.tipo === 'Administrador' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sede Escolar Asignada</label>
              <select
                value={idSchool}
                onChange={(e) => setIdSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value="">(Sin asignar / General)</option>
                {schoolsList.map((s) => (
                  <option key={s.Id_school} value={s.Id_school}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
