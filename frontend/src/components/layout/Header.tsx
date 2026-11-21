import React from 'react'
import { LogOut, User as UserIcon, School as SchoolIcon, Menu } from 'lucide-react'
import { getImageUrl } from '../../utils/imageUrl'
import { Usuario, School } from '../../types'

interface HeaderProps {
  school?: School | null
  user: Usuario | null
  onLogout: () => void
  onToggleSidebar: () => void
}

// Encabezado 
export default function Header({ school, user, onLogout, onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
          title="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {school?.foto ? (
            <img
              src={getImageUrl(school.foto)}
              alt={school.nombre}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
              <SchoolIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight truncate max-w-[160px] sm:max-w-xs">
              {school?.nombre || 'Sede Escolar'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[160px] sm:max-w-xs hidden sm:block">
              {school?.direccion || 'Coordenadas y GPS Activo'}
            </p>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Perfil de Usuario y Cierre de Sesión */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[180px] lg:max-w-[260px]">
            {user?.nombre || 'Usuario'}
          </p>
          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mt-0.5">
            {user?.tipo || 'Usuario'}
          </span>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 font-semibold text-xs sm:text-sm">
          {user?.nombre ? user.nombre.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>

        <button
          onClick={onLogout}
          title="Cerrar Sesión"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

