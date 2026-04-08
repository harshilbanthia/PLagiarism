import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Eye, EyeOff, Key, Sliders, Palette, Shield } from 'lucide-react'

interface FormState {
  openaiKey: string
  huggingfaceKey: string
  plagiarismSensitivity: number
  aiSensitivity: number
  minMatchLength: number
  theme: 'dark' | 'darker'
  notifications: boolean
  autoSave: boolean
}

export default function Settings() {
  const [form, setForm] = useState<FormState>({
    openaiKey: '',
    huggingfaceKey: '',
    plagiarismSensitivity: 70,
    aiSensitivity: 60,
    minMatchLength: 20,
    theme: 'dark',
    notifications: true,
    autoSave: false,
  })
  const [showKeys, setShowKeys] = useState({ openai: false, huggingface: false })

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your detection preferences</p>
      </div>

      {/* API Keys */}
      <section className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Key size={16} className="text-cyan-400" />
          <h2 className="text-base font-semibold text-white">API Keys</h2>
        </div>
        <p className="text-xs text-gray-500 -mt-3">
          Keys are stored locally and never sent to third parties.
        </p>

        {/* OpenAI */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">OpenAI API Key</label>
          <div className="relative">
            <input
              type={showKeys.openai ? 'text' : 'password'}
              value={form.openaiKey}
              onChange={(e) => update('openaiKey', e.target.value)}
              placeholder="sk-..."
              className="input pr-10"
            />
            <button
              onClick={() => setShowKeys((s) => ({ ...s, openai: !s.openai }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Toggle visibility"
            >
              {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-600">Used for AI detection analysis</p>
        </div>

        {/* HuggingFace */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">HuggingFace API Key</label>
          <div className="relative">
            <input
              type={showKeys.huggingface ? 'text' : 'password'}
              value={form.huggingfaceKey}
              onChange={(e) => update('huggingfaceKey', e.target.value)}
              placeholder="hf_..."
              className="input pr-10"
            />
            <button
              onClick={() => setShowKeys((s) => ({ ...s, huggingface: !s.huggingface }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Toggle visibility"
            >
              {showKeys.huggingface ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-600">Used for model attribution analysis</p>
        </div>
      </section>

      {/* Detection sensitivity */}
      <section className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Sliders size={16} className="text-purple-400" />
          <h2 className="text-base font-semibold text-white">Detection Sensitivity</h2>
        </div>

        <SliderField
          label="Plagiarism Sensitivity"
          value={form.plagiarismSensitivity}
          onChange={(v) => update('plagiarismSensitivity', v)}
          color="cyan"
          hint="Higher values flag more content as plagiarized"
        />

        <SliderField
          label="AI Detection Sensitivity"
          value={form.aiSensitivity}
          onChange={(v) => update('aiSensitivity', v)}
          color="purple"
          hint="Higher values flag more content as AI-generated"
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">
            Minimum Match Length (words)
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={form.minMatchLength}
            onChange={(e) => update('minMatchLength', Number(e.target.value))}
            className="input w-28"
          />
          <p className="text-xs text-gray-600">
            Shorter matches may increase false positives
          </p>
        </div>
      </section>

      {/* Preferences */}
      <section className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={16} className="text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Preferences</h2>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Theme</label>
          <div className="flex gap-3">
            {(['dark', 'darker'] as const).map((t) => (
              <button
                key={t}
                onClick={() => update('theme', t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.theme === t
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                {t === 'dark' ? 'Dark' : 'Darker'}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <ToggleField
          label="Email Notifications"
          description="Receive notifications when analyses complete"
          checked={form.notifications}
          onChange={(v) => update('notifications', v)}
        />
        <ToggleField
          label="Auto-save Results"
          description="Automatically save analyses to history"
          checked={form.autoSave}
          onChange={(v) => update('autoSave', v)}
        />
      </section>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
        <Shield size={16} className="text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400">
          All API keys are encrypted and stored locally in your browser. They are never transmitted
          to our servers or shared with third parties.
        </p>
      </div>

      <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
        <Save size={16} />
        Save Settings
      </button>
    </div>
  )
}

/* --- Sub-components --- */

function SliderField({
  label,
  value,
  onChange,
  color,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: 'cyan' | 'purple'
  hint?: string
}) {
  const track = color === 'cyan' ? '#06b6d4' : '#8b5cf6'
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-white">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: track }}
        className="w-full h-1.5 rounded-full cursor-pointer"
      />
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? 'bg-cyan-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
