import React, { useState, useRef } from 'react'
import { UploadCloud, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react'
import { getImageUrl } from '../../utils/imageUrl'

interface ImageUploadProps {
  label?: string
  value?: string
  onFileChange: (file: File | null) => void
  onUrlChange: (url: string) => void
}

export default function ImageUpload({
  label = 'Fotografía / Logotipo',
  value = '',
  onFileChange,
  onUrlChange
}: ImageUploadProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB')
        return
      }
      setFileName(file.name)
      setFileSize((file.size / 1024).toFixed(0) + ' KB')
      const previewUrl = URL.createObjectURL(file)
      setFilePreview(previewUrl)
      onFileChange(file)
    }
  }

  const handleClear = () => {
    setFilePreview(null)
    setFileName('')
    setFileSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onFileChange(null)
    onUrlChange('')
  }

  const currentPreview = filePreview || (value ? getImageUrl(value) : null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-2 py-0.5 rounded-md font-medium transition ${
              mode === 'file' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md font-medium transition ${
              mode === 'url' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Enlace URL
          </button>
        </div>
      </div>

      {mode === 'file' ? (
        <div className="flex items-center gap-4 p-3 bg-slate-50/70 border border-dashed border-slate-300 rounded-xl">
          {currentPreview ? (
            <div className="relative group shrink-0">
              <img
                src={currentPreview}
                alt="Vista previa"
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-sm transition"
                title="Quitar imagen"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
              <ImageIcon className="w-7 h-7" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              id="file-upload-input"
            />
            {fileName ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{fileName}</p>
                <p className="text-[11px] text-slate-400">{fileSize}</p>
                <label
                  htmlFor="file-upload-input"
                  className="inline-block text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  Cambiar imagen
                </label>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="file-upload-input"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                  Elegir imagen del equipo
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG o WEBP hasta 5MB</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={value}
              onChange={(e) => {
                onUrlChange(e.target.value)
                setFilePreview(null)
                onFileChange(null)
              }}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {value && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <img
                src={getImageUrl(value)}
                alt="Vista previa URL"
                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'
                }}
              />
              <span className="text-xs text-slate-500 truncate">{value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

