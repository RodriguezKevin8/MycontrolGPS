import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, School as SchoolIcon } from 'lucide-react'
import Card from '../components/common/Card'
import Modal from '../components/common/Modal'
import ImageUpload from '../components/common/ImageUpload'
import InteractiveMap from '../components/map/InteractiveMap'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUrl'
import { Usuario, School } from '../types'

interface EscuelasPageProps {
  user: Usuario | null
  onSchoolUpdated?: () => void
}

export default function EscuelasPage({ user, onSchoolUpdated }: EscuelasPageProps) {
  const [schools, setSchools] = useState<School[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(false)

  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [email, setEmail] = useState('')
  const [foto, setFoto] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [latitud, setLatitud] = useState(14.6349)
  const [longitud, setLongitud] = useState(-90.5068)
  const [idUser, setIdUser] = useState<number | string>('')
  const [usersList, setUsersList] = useState<Usuario[]>([])

  const loadSchools = () => {
    api.get<School[]>('/schools').then((res) => setSchools(res.data))
    if (user?.tipo === 'Administrador') {
      api.get<Usuario[]>('/usuarios').then((res) => setUsersList(res.data)).catch(() => {})
    }
  }

  useEffect(() => {
    loadSchools()
  }, [])

  const handleOpenCreate = () => {
    setEditingSchool(null)
    setNombre('')
    setDireccion('')
    setEmail('')
    setFoto('')
    setFotoFile(null)
    setLatitud(14.6349)
    setLongitud(-90.5068)
    setIdUser(usersList[0]?.id_user || user?.id_user || '')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (school: School) => {
    setEditingSchool(school)
    setNombre(school.nombre)
    setDireccion(school.direccion || '')
    setEmail(school.email || '')
    setFoto(school.foto || '')
    setFotoFile(null)
    setLatitud(school.latitud || 14.6349)
    setLongitud(school.longitud || -90.5068)
    setIdUser(school.id_user || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (fotoFile) {
     
        const formData = new FormData()
        formData.append('nombre', nombre)
        if (direccion) formData.append('direccion', direccion)
        if (email) formData.append('email', email)
        if (latitud) formData.append('latitud', String(latitud))
        if (longitud) formData.append('longitud', String(longitud))
        if (idUser) formData.append('id_user', String(idUser))
        formData.append('foto', fotoFile)

        if (editingSchool) {
          formData.append('_method', 'PUT')
          await api.post(`/schools/${editingSchool.Id_school}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          await api.post('/schools', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      } else {
        const payload: any = { nombre, direccion, email, foto, latitud, longitud }
        if (idUser) payload.id_user = Number(idUser)

        if (editingSchool) {
          await api.put(`/schools/${editingSchool.Id_school}`, payload)
        } else {
          await api.post('/schools', payload)
        }
      }
      setIsModalOpen(false)
      loadSchools()
      if (onSchoolUpdated) onSchoolUpdated()
    } catch (err: any) {
      const serverMessage = err.response?.data?.message
      const errors = err.response?.data?.errors
      const detailed = errors ? Object.values(errors).flat().join('\n') : serverMessage
      alert(detailed || 'Error al guardar la escuela')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro de escuela?')) return
    try {
      await api.delete(`/schools/${id}`)
      loadSchools()
      if (onSchoolUpdated) onSchoolUpdated()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Gestión de Escuelas</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Listado de instituciones y geolocalización de sedes</p>
        </div>

        {user?.tipo === 'Administrador' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Escuela
          </button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Institución</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Coordenadas GPS</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {schools.map((school) => (
                <tr key={school.Id_school} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {school.foto ? (
                        <img src={getImageUrl(school.foto)} alt={school.nombre} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <SchoolIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">{school.nombre}</span>
                        <span className="text-xs text-slate-400">
                          ID: #{school.Id_school} {school.usuario ? `• Encargado: ${school.usuario.nombre}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">{school.direccion || 'Sin dirección'}</td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">{school.email || 'Sin correo'}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      {school.latitud && school.longitud ? `${school.latitud}, ${school.longitud}` : 'Sin GPS'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(school)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Editar Escuela"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user?.tipo === 'Administrador' && (
                      <button
                        onClick={() => handleDelete(school.Id_school)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Eliminar Escuela"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchool ? 'Modificar Escuela' : 'Registrar Nueva Escuela'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre de la Escuela *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Colegio San José"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@colegio.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dirección de la Sede</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Av. Principal #123, Zona 1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <ImageUpload
            label="Logotipo o Fachada de la Institución"
            value={foto}
            onFileChange={setFotoFile}
            onUrlChange={setFoto}
          />

          {user?.tipo === 'Administrador' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Usuario Encargado (Director / Responsable)
              </label>
              <select
                value={idUser}
                onChange={(e) => setIdUser(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                {usersList.map((u) => (
                  <option key={u.id_user} value={u.id_user}>
                    {u.nombre} (@{u.usuario}) &bull; {u.tipo}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Este usuario podrá iniciar sesión y gestionar exclusivamente esta sede escolar.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Ubicación en el Mapa (Clic para capturar)</span>
              <span className="text-indigo-600 font-mono text-[11px] font-bold">
                Lat: {latitud} | Lng: {longitud}
              </span>
            </label>
            <InteractiveMap
              mode="select"
              selectedLocation={{ lat: latitud, lng: longitud }}
              onLocationSelect={({ lat, lng }) => {
                setLatitud(lat)
                setLongitud(lng)
              }}
              height="260px"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Escuela'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

