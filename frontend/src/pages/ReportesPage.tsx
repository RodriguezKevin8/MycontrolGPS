import React, { useState, useEffect } from 'react'
import { Printer, School as SchoolIcon, Users } from 'lucide-react'
import Card from '../components/common/Card'
import api from '../services/api'
import { SchoolReportItem, StudentReportItem } from '../types'

export default function ReportesPage() {
  const [tab, setTab] = useState<'escuelas' | 'alumnos'>('escuelas')
  const [escuelasData, setEscuelasData] = useState<SchoolReportItem[]>([])
  const [alumnosData, setAlumnosData] = useState<StudentReportItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (tab === 'escuelas') {
      api.get<SchoolReportItem[]>('/reportes/escuelas')
        .then((res) => setEscuelasData(res.data))
        .finally(() => setLoading(false))
    } else {
      api.get<StudentReportItem[]>('/reportes/alumnos')
        .then((res) => setAlumnosData(res.data))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Centro de Reportes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Informes oficiales requeridos por la prueba técnica</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 print:hidden gap-4 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setTab('escuelas')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            tab === 'escuelas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SchoolIcon className="w-4 h-4" />
          Reporte General de Escuelas
        </button>

        <button
          onClick={() => setTab('alumnos')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            tab === 'alumnos'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Reporte de Alumnos y Encargados
        </button>
      </div>

      <Card
        title={tab === 'escuelas' ? 'Informe General de Sedes Educativas' : 'Informe Detallado de Alumnos y Responsables'}
        
      >
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando reporte...</div>
        ) : tab === 'escuelas' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/80">
                  <th className="py-3 px-4">Escuela</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Responsable (Director)</th>
                  <th className="py-3 px-4 text-center">Total Alumnos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escuelasData.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{e.nombre}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{e.direccion}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{e.email}</td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">{e.responsable}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {e.total_alumnos}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50/80">
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4">Escuela</th>
                  <th className="py-3 px-4">Grado y Sección</th>
                  <th className="py-3 px-4">GPS Residencia</th>
                  <th className="py-3 px-4">Encargados / Tutores y Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumnosData.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{a.nombre}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">{a.escuela}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{a.grado_seccion}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{a.coordenadas}</td>
                    <td className="py-3.5 px-4 text-xs">
                      {a.encargados && a.encargados.length > 0 ? (
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {a.encargados.map((enc, idx) => (
                            <li key={idx}>{enc}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400">Sin encargados</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

