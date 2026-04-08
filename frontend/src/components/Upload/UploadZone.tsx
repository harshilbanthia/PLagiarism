import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Send } from 'lucide-react'

interface UploadZoneProps {
  onSubmitText: (text: string) => void
  onSubmitFile: (file: File) => void
  loading?: boolean
}

type TabType = 'text' | 'file'

export default function UploadZone({ onSubmitText, onSubmitFile, loading = false }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<TabType>('text')
  const [text, setText] = useState('')
  const [droppedFile, setDroppedFile] = useState<File | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setDroppedFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: loading,
  })

  const handleSubmit = () => {
    if (activeTab === 'text' && text.trim().length > 0) {
      onSubmitText(text.trim())
    } else if (activeTab === 'file' && droppedFile) {
      onSubmitFile(droppedFile)
    }
  }

  const canSubmit =
    !loading && ((activeTab === 'text' && text.trim().length > 50) || (activeTab === 'file' && !!droppedFile))

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-white mb-4">Analyze Content</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit mb-5">
        {(['text', 'file'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-cyan-500/30 to-purple-600/30 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'text' ? 'Text Input' : 'File Upload'}
          </button>
        ))}
      </div>

      {/* Text input tab */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type the content you want to analyze for plagiarism and AI generation..."
            rows={8}
            disabled={loading}
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3
                       focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30
                       transition-colors resize-y text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {text.length} characters{text.length < 50 && text.length > 0 ? ' (min 50)' : ''}
            </span>
            {text.length > 0 && (
              <button
                onClick={() => setText('')}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* File upload tab */}
      {activeTab === 'file' && (
        <div className="space-y-3">
          {!droppedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload
                size={36}
                className={`mx-auto mb-3 ${isDragActive ? 'text-cyan-400' : 'text-gray-500'}`}
              />
              <p className={`font-medium text-sm ${isDragActive ? 'text-cyan-400' : 'text-gray-300'}`}>
                {isDragActive ? 'Drop your file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-600 mt-3">Supports: .txt, .pdf, .doc, .docx</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-xl">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{droppedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(droppedFile.size / 1024).toFixed(1)} KB · {droppedFile.type || 'Unknown type'}
                </p>
              </div>
              <button
                onClick={() => setDroppedFile(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
          canSubmit
            ? 'btn-primary'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send size={16} />
            Analyze Content
          </>
        )}
      </button>
    </div>
  )
}
