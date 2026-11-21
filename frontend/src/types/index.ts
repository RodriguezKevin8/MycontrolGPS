// Definición de tipos TypeScript para el sistema escolar MycontrolGPS

export interface Usuario {
  id_user: number
  nombre: string
  usuario: string
  tipo: 'Administrador' | 'Usuario'
  created_at?: string
  updated_at?: string
  school?: School | null
}

export interface School {
  Id_school: number
  nombre: string
  direccion?: string | null
  email?: string | null
  foto?: string | null
  latitud?: number | null
  longitud?: number | null
  id_user: number
  usuario?: {
    id_user: number
    nombre: string
    usuario: string
  }
  created_at?: string
  updated_at?: string
}

export interface Padre {
  id_padre: number
  nombre: string
  direccion?: string | null
  telefono?: string | null
  id_school?: number | null
  school?: School | null
  created_at?: string
  updated_at?: string
  pivot?: {
    id_padre_alumno?: number
    parentesco?: string
  }
}

export interface Alumno {
  id_alumno: number
  nombre_completo: string
  direccion?: string | null
  telefono?: string | null
  email?: string | null
  foto?: string | null
  genero?: string | null
  latitud?: number | null
  longitud?: number | null
  id_grado?: number | null
  id_seccion?: number | null
  id_school: number
  school?: {
    Id_school: number
    nombre: string
  }
  padres?: Padre[]
  created_at?: string
  updated_at?: string
}

export interface MarkerItem {
  id: string
  tipo: 'escuela' | 'alumno'
  titulo: string
  direccion?: string | null
  lat: number
  lng: number
  foto?: string | null
  grado?: string
  seccion?: string
  tutores?: string
}

export interface DashboardResponse {
  school: School | null
  total_alumnos: number
  total_mapeados: number
  markers: MarkerItem[]
}

export interface SchoolReportItem {
  id: number
  nombre: string
  direccion: string
  email: string
  coordenadas: string
  responsable: string
  total_alumnos: number
}

export interface StudentReportItem {
  id: number
  nombre: string
  escuela: string
  telefono: string
  email: string
  genero: string
  grado_seccion: string
  coordenadas: string
  encargados: string[]
}

