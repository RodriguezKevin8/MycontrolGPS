import React, { useState, useEffect } from 'react'
import { Users, School as SchoolIcon, MapPin } from 'lucide-react'
import Card from '../components/common/Card'
import InteractiveMap from '../components/map/InteractiveMap'
import api from '../services/api'
import { Usuario, School, DashboardResponse } from '../types'

interface DashboardPageProps {
  user: Usuario | null
  onSchoolChange?: (school: School) => void
}

export default function DashboardPage({ user, onSchoolChange }: DashboardPageProps) {
  const [data, setData] = useState<DashboardResponse>({
    school: null,
    markers: [],
    total_alumnos: 0,
    total_mapeados: 0
  })
  const [schoolsList, setSchoolsList] = useState<School[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | number>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.tipo === 'Administrador') {
      api.get<School[]>('/schools').then((res) => {
        setSchoolsList(res.data)
        if (res.data.length > 0 && !selectedSchoolId) {
          setSelectedSchoolId(res.data[0].Id_school)
        }
      })
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    const url = selectedSchoolId ? `/dashboard?id_school=${selectedSchoolId}` : '/dashboard'
    api.get<DashboardResponse>(url)
      .then((res) => {
        setData(res.data)
        if (onSchoolChange && res.data.school) {
          onSchoolChange(res.data.school)
        }
      })
      .finally(() => setLoading(false))
  }, [selectedSchoolId])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado*/}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard Geográfico</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualización en tiempo real de sedes escolares y residencia de alumnos
          </p>
        </div>

        {user?.tipo === 'Administrador' && schoolsList.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filtrar Sede:</span>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {schoolsList.map((s) => (
                <option key={s.Id_school} value={s.Id_school}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <SchoolIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Sede Escolar</span>
            <span className="text-sm sm:text-base font-bold text-slate-900 truncate block">
              {data.school?.nombre || 'Cargando...'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Total Alumnos</span>
            <span className="text-xl font-bold text-slate-900">{data.total_alumnos}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Alumnos con GPS</span>
            <span className="text-xl font-bold text-slate-900">{data.total_mapeados}</span>
          </div>
        </div>
      </div>

      {/* Contenedor Principal del Mapa */}
      <Card
        title="Mapa de Geolocalización Escolar y Residencial"
        subtitle="Los marcadores muestran la sede educativa y la ubicación de las viviendas de los estudiantes"
        action={
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span className="text-slate-600">Escuela</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Alumnos</span>
            </div>
          </div>
        }
      >
        <div className="relative">
          <InteractiveMap
            mode="dashboard"
            markers={data.markers}
            height="520px"
          />
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 transition-opacity rounded-2xl">
              <div className="px-4 py-2 bg-white rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                Cargando mapa interactivo...
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

