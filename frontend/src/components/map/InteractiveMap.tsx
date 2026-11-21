import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { getImageUrl } from '../../utils/imageUrl'
import { MarkerItem } from '../../types'

interface InteractiveMapProps {
  mode?: 'dashboard' | 'select'
  markers?: MarkerItem[]
  selectedLocation?: { lat: number; lng: number } | null
  onLocationSelect?: (coords: { lat: number; lng: number }) => void
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function InteractiveMap({
  mode = 'dashboard',
  markers = [],
  selectedLocation = null,
  onLocationSelect,
  center = [14.6349, -90.5068],
  zoom = 13,
  height = '500px'
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const clusterGroupRef = useRef<any>(null)


  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      })


      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map

      if (mode === 'select' && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng
          onLocationSelect({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) })
        })
      }
    }

    return () => {
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers()
        clusterGroupRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

 
  useEffect(() => {
    if (!mapInstanceRef.current || mode !== 'dashboard' || !markersLayerRef.current) return

    const map = mapInstanceRef.current
    markersLayerRef.current.clearLayers()

  
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 1.8,
        maxClusterRadius: 35,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount()
          return L.divIcon({
            html: `
              <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/40 border-2 border-white cursor-pointer hover:scale-110 transition duration-150 transform -translate-x-1/2 -translate-y-1/2">
                <div class="flex items-center gap-0.5">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  <span>${count}</span>
                </div>
              </div>
            `,
            className: 'bg-transparent border-0',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        }
      })
      map.addLayer(clusterGroupRef.current)
    } else {
      clusterGroupRef.current.clearLayers()
    }

    const bounds: [number, number][] = []

    markers.forEach((m) => {
      const lat = Number(m.lat)
      const lng = Number(m.lng)
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return

      const isSchool = m.tipo === 'escuela'

      const customIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: `
          <div class="flex items-center justify-center w-10 h-10 rounded-2xl shadow-lg border-2 ${
            isSchool
              ? 'bg-indigo-600 border-white text-white shadow-indigo-300'
              : 'bg-emerald-500 border-white text-white shadow-emerald-200'
          } transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition duration-150">
            ${
              isSchool
                ? '<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg>'
                : '<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
            }
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })

      const popupContent = `
        <div class="p-1 max-w-xs font-sans">
          ${m.foto ? `<img src="${getImageUrl(m.foto)}" class="w-full h-24 object-cover rounded-xl mb-2 border border-slate-100" />` : ''}
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isSchool ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
            }">${isSchool ? 'Sede Escolar' : 'Alumno'}</span>
            ${m.grado ? `<span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${m.grado}</span>` : ''}
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-tight">${m.titulo}</h4>
          ${m.direccion ? `<p class="text-xs text-slate-500 mt-0.5">${m.direccion}</p>` : ''}
          ${m.tutores ? `<p class="text-[11px] text-slate-600 mt-1.5 border-t border-slate-100 pt-1"><strong>Tutores:</strong> ${m.tutores}</p>` : ''}
        </div>
      `

      const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent)

      if (isSchool) {
        markersLayerRef.current?.addLayer(marker)
      } else {
    
        clusterGroupRef.current?.addLayer(marker)
      }

      bounds.push([lat, lng])
    })

    setTimeout(() => {
      map.invalidateSize()
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    }, 150)
  }, [markers, mode])

  useEffect(() => {
    if (!mapInstanceRef.current || mode !== 'select' || !markersLayerRef.current) return

    markersLayerRef.current.clearLayers()
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers()
    }

    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      const selectIcon = L.divIcon({
        className: 'select-pin',
        html: `
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 border-2 border-white text-white shadow-lg shadow-rose-200 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: selectIcon,
        draggable: true
      })

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        if (onLocationSelect) {
          onLocationSelect({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) })
        }
      })

      markersLayerRef.current.addLayer(marker)
      mapInstanceRef.current.panTo([selectedLocation.lat, selectedLocation.lng])
    }
  }, [selectedLocation, mode])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {mode === 'select' && (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-medium text-slate-700 shadow-md border border-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Haz clic o arrastra el pin para fijar coordenadas
        </div>
      )}
    </div>
  )
}

