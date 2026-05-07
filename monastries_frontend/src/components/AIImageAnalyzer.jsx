import { useRef, useState } from 'react'
import { Upload, Loader2, X, Sparkles, Camera, RotateCcw } from 'lucide-react'
import { api } from '../api'

export function AIImageAnalyzer({ onAnalysisComplete, monasteryContext }) {
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const processFile = async (file) => {
    if (!file) return
    setError(null)
    setAnalysis(null)

    if (file.size > 20 * 1024 * 1024) {
      setError('Image too large. Maximum 20MB allowed.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, etc.)')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result
      const base64 = dataUrl?.split(',')[1]
      if (!base64) { setError('Failed to read image'); return }

      setPreview(dataUrl)
      setLoading(true)

      try {
        const { data } = await api.post('/ai/analyze-image', {
          imageBase64: base64,
          metadata: {
            monasteryName: monasteryContext?.name || 'Monastery',
            region: monasteryContext?.location || 'Sikkim',
          },
        })
        setAnalysis(data.analysis)
        onAnalysisComplete?.(data.analysis)
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to analyze image')
        setPreview(null)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  const handleReset = () => {
    setPreview(null)
    setAnalysis(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Analysis result view ───────────────────────────────────────────────
  if (analysis) {
    return (
      <div className="space-y-4">
        {preview && (
          <div className="relative">
            <img src={preview} alt="Analyzed monastery"
              className="w-full h-52 object-cover rounded-xl border border-amber-500/20" />
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3 h-3" /> Analysed
            </div>
          </div>
        )}

        <div className="glass p-5 rounded-xl border border-amber-500/10">
          <h3 className="font-heading text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> DharmaGuide Analysis
          </h3>
          <div className="space-y-2">
            {analysis.split('\n').map((line, i) => {
              if (!line.trim()) return <div key={i} className="h-1" />
              return (
                <p key={i} className="text-amber-100/75 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>')
                  }} />
              )
            })}
          </div>
        </div>

        <button onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 text-amber-200/70 hover:text-amber-200 hover:border-amber-500/50 transition text-sm">
          <RotateCcw className="w-4 h-4" /> Analyse another image
        </button>
      </div>
    )
  }

  // ── Upload view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        className="hidden"
      />

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full p-8 rounded-xl border-2 border-dashed transition flex flex-col items-center gap-3 text-center
          ${dragOver
            ? 'border-amber-500/60 bg-amber-500/10'
            : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/8'
          } disabled:opacity-40`}>
        {loading ? (
          <>
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <div>
              <p className="text-amber-100 font-medium text-sm">Analysing your photo…</p>
              <p className="text-amber-200/40 text-xs mt-1">DharmaGuide is examining the monastery</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Camera className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-50 font-medium text-sm">
                {dragOver ? 'Drop to analyse' : 'Upload a monastery photo'}
              </p>
              <p className="text-amber-200/40 text-xs mt-1">Drag & drop or click · Max 20MB</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-amber-500/50">
              <Upload className="w-3 h-3" /> JPG · PNG · WEBP · HEIC
            </div>
          </>
        )}
      </button>

      {/* Preview (before analysis runs) */}
      {preview && !analysis && !loading && (
        <div className="relative">
          <img src={preview} alt="Preview"
            className="w-full h-40 object-cover rounded-xl border border-amber-500/20" />
          <button onClick={handleReset}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-stone-900/80 border border-amber-900/50 flex items-center justify-center text-amber-200/60 hover:text-amber-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
