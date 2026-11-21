import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, User, Users } from 'lucide-react'
import Card from '../components/common/Card'
import Modal from '../components/common/Modal'
import ImageUpload from '../components/common/ImageUpload'
import InteractiveMap from '../components/map/InteractiveMap'
import api from '../services/api'
import { getImageUrl } from '../utils/imageUrl'
import { Usuario, Alumno, Padre, School } from '../types'

interface AlumnosPageProps {
  user: Usuario | null
}

export default function AlumnosPage({ user }: AlumnosPageProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [padresList, setPadresList] = useState<Padre[]>([])
  const [schoolsList, setSchoolsList] = useState<School[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null)
  const [loading, setLoading] = useState(false)


  
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [foto, setFoto] = useState('')
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [genero, setGenero] = useState('Masculino')
  const [idGrado, setIdGrado] = useState(1)
  const [idSeccion, setIdSeccion] = useState(1)
  const [idSchool, setIdSchool] = useState<string | number>('')
  const [latitud, setLatitud] = useState(14.638)
  const [longitud, setLongitud] = useState(-90.502)
  const [selectedPadres, setSelectedPadres] = useState<{ id_padre: number; parentesco: string }[]>([])

  const loadData = () => {
    api.get<Alumno[]>('/alumnos').then((res) => setAlumnos(res.data))
    api.get<Padre[]>('/padres').then((res) => setPadresList(res.data))
    if (user?.tipo === 'Administrador') {
      api.get<School[]>('/schools').then((res) => setSchoolsList(res.data))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingAlumno(null)
    setNombreCompleto('')
    setDireccion('')
    setTelefono('')
    setEmail('')
    setFoto('')
    setFotoFile(null)
    setGenero('Masculino')
    setIdGrado(1)
    setIdSeccion(1)
    setIdSchool(schoolsList[0]?.Id_school || '')
    setLatitud(14.638)
    setLongitud(-90.502)
    setSelectedPadres([])
    setIsModalOpen(true)
  }

  const handleOpenEdit = (a: Alumno) => {
    setEditingAlumno(a)
    setNombreCompleto(a.nombre_completo)
    setDireccion(a.direccion || '')
    setTelefono(a.telefono || '')
    setEmail(a.email || '')
    setFoto(a.foto || '')
    setFotoFile(null)
    setGenero(a.genero || 'Masculino')
    setIdGrado(a.id_grado || 1)
    setIdSeccion(a.id_seccion || 1)
    setIdSchool(a.id_school || '')
    setLatitud(a.latitud || 14.638)
    setLongitud(a.longitud || -90.502)
    setSelectedPadres(
      a.padres?.map((p) => ({
        id_padre: p.id_padre,
        parentesco: p.pivot?.parentesco || 'Tutor'
      })) || []
    )
    setIsModalOpen(true)
  }

  const handleAddPadreRow = () => {
    if (padresList.length === 0) {
      alert('Debes registrar tutores en el módulo de Padres primero')
      return
    }
    setSelectedPadres([...selectedPadres, { id_padre: padresList[0].id_padre, parentesco: 'Padre' }])
  }

  const handleRemovePadreRow = (index: number) => {
    setSelectedPadres(selectedPadres.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (fotoFile) {
        const formData = new FormData()
        formData.append('nombre_completo', nombreCompleto)
        if (direccion) formData.append('direccion', direccion)
        if (telefono) formData.append('telefono', telefono)
        if (email) formData.append('email', email)
        if (genero) formData.append('genero', genero)
        formData.append('id_grado', String(idGrado))
        formData.append('id_seccion', String(idSeccion))
        if (idSchool) formData.append('id_school', String(idSchool))
        if (latitud) formData.append('latitud', String(latitud))
        if (longitud) formData.append('longitud', String(longitud))
        formData.append('padres', JSON.stringify(selectedPadres))
        formData.append('foto', fotoFile)

        if (editingAlumno) {
          formData.append('_method', 'PUT')
          await api.post(`/alumnos/${editingAlumno.id_alumno}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          await api.post('/alumnos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      } else {
        const payload = {
          nombre_completo: nombreCompleto,
          direccion,
          telefono,
          email,
          foto,
          genero,
          id_grado: Number(idGrado),
          id_seccion: Number(idSeccion),
          id_school: idSchool || undefined,
          latitud,
          longitud,
          padres: selectedPadres
        }
        if (editingAlumno) {
          await api.put(`/alumnos/${editingAlumno.id_alumno}`, payload)
        } else {
          await api.post('/alumnos', payload)
        }
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      const serverMessage = err.response?.data?.message
      const errors = err.response?.data?.errors
      const detailed = errors ? Object.values(errors).flat().join('\n') : serverMessage
      alert(detailed || 'Error al guardar el alumno')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Deseas eliminar este registro de alumno?')) return
    try {
      await api.delete(`/alumnos/${id}`)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Gestión de Alumnos</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Control de matrícula, residencia y asignación de tutores</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo Alumno
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Escuela</th>
                <th className="py-3 px-4">Grado y Sección</th>
                <th className="py-3 px-4">Tutores / Padres</th>
                <th className="py-3 px-4">Ubicación GPS</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {alumnos.map((a) => (
                <tr key={a.id_alumno} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {a.foto ? (
                        <img src={getImageUrl(a.foto)} alt={a.nombre_completo} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">{a.nombre_completo}</span>
                        <span className="text-xs text-slate-400">{a.telefono || a.email || 'Sin contacto'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium text-xs sm:text-sm">{a.school?.nombre || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold whitespace-nowrap">
                      Grado {a.id_grado} &bull; Secc. {a.id_seccion}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {a.padres && a.padres.length > 0 ? (
                      <div className="space-y-0.5">
                        {a.padres.map((p) => (
                          <div key={p.id_padre} className="truncate max-w-xs">
                            <span className="font-semibold">{p.nombre}</span> ({p.pivot?.parentesco || 'Tutor'})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">Sin tutores</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {a.latitud && a.longitud ? `${a.latitud}, ${a.longitud}` : 'Sin GPS'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Editar Alumno"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id_alumno)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Eliminar Alumno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        title={editingAlumno ? 'Modificar Datos de Alumno' : 'Registrar Nuevo Alumno'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Ej. Mateo Méndez Flores"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Género</label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Grado</label>
              <input
                type="number"
                min="1"
                max="12"
                value={idGrado}
                onChange={(e) => setIdGrado(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Sección</label>
              <input
                type="number"
                min="1"
                max="10"
                value={idSeccion}
                onChange={(e) => setIdSeccion(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            {user?.tipo === 'Administrador' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Escuela Asignada</label>
                <select
                  value={idSchool}
                  onChange={(e) => setIdSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {schoolsList.map((s) => (
                    <option key={s.Id_school} value={s.Id_school}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 5551-1122 o 8007-0409"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="estudiante@escuela.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dirección Residencial</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Colonia o Calle..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <ImageUpload
            label="Fotografía del Estudiante"
            value={foto}
            onFileChange={setFotoFile}
            onUrlChange={setFoto}
          />

          {/* Sección N:M Padres / Responsables */}
          <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                Padres / Responsables Vinculados ({selectedPadres.length})
              </span>
              <button
                type="button"
                onClick={handleAddPadreRow}
                className="text-xs text-indigo-600 font-semibold hover:underline self-start sm:self-auto"
              >
                + Vincular Padre/Tutor
              </button>
            </div>

            {selectedPadres.map((row, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 sm:bg-transparent sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                <select
                  value={row.id_padre}
                  onChange={(e) => {
                    const copy = [...selectedPadres]
                    copy[idx].id_padre = parseInt(e.target.value)
                    setSelectedPadres(copy)
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {padresList.map((p) => (
                    <option key={p.id_padre} value={p.id_padre}>{p.nombre}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <select
                    value={row.parentesco}
                    onChange={(e) => {
                      const copy = [...selectedPadres]
                      copy[idx].parentesco = e.target.value
                      setSelectedPadres(copy)
                    }}
                    className="flex-1 sm:w-36 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Tutor Legal">Tutor Legal</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemovePadreRow(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 text-lg font-bold"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Ubicación de Vivienda (Clic en el mapa)</span>
              <span className="text-emerald-600 font-mono text-[11px] font-bold">
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
              height="240px"
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
              {loading ? 'Guardando...' : 'Guardar Alumno'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

