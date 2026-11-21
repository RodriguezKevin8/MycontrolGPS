import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Users, UserCheck, FileBarChart, MapPin, X, ShieldCheck } from 'lucide-react'
import { Usuario } from '../../types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  user?: Usuario | null
}

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Escuelas', path: '/escuelas', icon: GraduationCap },
    { name: 'Padres', path: '/padres', icon: Users },
    { name: 'Alumnos', path: '/alumnos', icon: UserCheck },
    { name: 'Reportes', path: '/reportes', icon: FileBarChart },
    ...(user?.tipo === 'Administrador'
      ? [{ name: 'Usuarios', path: '/usuarios', icon: ShieldCheck }]
      : []),
  ]

  return (
    <>
    
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
  
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg block leading-tight">MycontrolGPS</span>
              <span className="text-xs text-slate-400 font-medium">Gestión Escolar</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center mt-auto bg-white">
          TypeScript &bull; v1.0.0
        </div>
      </aside>
    </>
  )
}

