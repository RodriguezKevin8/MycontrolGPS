/**
 * Convierte rutas relativas de storage (/storage/...) en URLs completas del backend
 * o retorna la URL tal cual si ya es absoluta (https://...).
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api'
  const host = apiBase.replace(/\/api\/?$/, '')
  return `${host}${path.startsWith('/') ? '' : '/'}${path}`
}

