import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Link2, Loader2, ChefHat, Clock, Users, Check, Globe, Lock } from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'

const CATEGORIES = ['vegetais', 'carne', 'peixe', 'entradas', 'sobremesas', 'massa', 'sopa', 'outro'] as const
const CATEGORY_LABELS: Record<string, string> = {
  vegetais: '🥦 Vegetais', carne: '🥩 Carne', peixe: '🐟 Peixe',
  entradas: '🍢 Entradas', sobremesas: '🍮 Sobremesas', massa: '🍝 Massa',
  sopa: '🍲 Sopa', outro: '🍽️ Outro',
}

export default function AddRecipePage() {
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState('pt')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<any>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [upgradeType, setUpgradeType] = useState<'EXTRACTION_LIMIT' | 'RECIPES_LIMIT' | null>(null)
  const navigate = useNavigate()

  const handleExtract = async () => {
    if (!url.trim()) return
    setLoading(true)
    setRecipe(null)
    try {
      const { data } = await api.post('/api/recipes/extract', { url, language })
      setRecipe(data)
    } catch (err: any) {
      const code = err.response?.data?.code
      if (code === 'EXTRACTION_LIMIT') { setUpgradeType('EXTRACTION_LIMIT'); return }
      toast.error(err.response?.data?.error || 'Erro ao extrair receita')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!recipe) return
    setSaving(true)
    try {
      const { data } = await api.post('/api/recipes', { ...recipe, isPublic })
      toast.success('Receita guardada!')
      navigate(`/receita/${data.id}`)
    } catch (err: any) {
      const code = err.response?.data?.code
      if (code === 'RECIPES_LIMIT') { setUpgradeType('RECIPES_LIMIT'); return }
      toast.error('Erro ao guardar receita')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {upgradeType && <UpgradeModal type={upgradeType} onClose={() => setUpgradeType(null)} />}
      <h1 className="text-2xl font-bold mb-6">Adicionar Receita</h1>

      {/* URL Input */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExtract()}
            placeholder="Cola o link do YouTube, TikTok ou Instagram..."
            className="w-full pl-9 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
        </div>
        <button
          onClick={handleExtract}
          disabled={loading || !url.trim()}
          className="px-4 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-opacity"
          style={{ background: '#315675' }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ChefHat size={18} />}
          {loading ? 'A extrair...' : 'Extrair'}
        </button>
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs text-gray-500">Língua da receita:</span>
        {[
          { code: 'pt', label: '🇵🇹 Português' },
          { code: 'en', label: '🇬🇧 English' },
          { code: 'es', label: '🇪🇸 Español' },
          { code: 'fr', label: '🇫🇷 Français' },
        ].map(l => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${language === l.code ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            style={language === l.code ? { background: '#315675' } : { background: 'transparent' }}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" />
          <p>A analisar o vídeo com IA...</p>
        </div>
      )}

      {/* Recipe preview */}
      {recipe && !loading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <input
              value={recipe.title}
              onChange={e => setRecipe({ ...recipe, title: e.target.value })}
              className="text-xl font-bold bg-transparent border-b border-gray-700 focus:border-gray-500 outline-none w-full pb-1 mb-2"
            />
            <textarea
              value={recipe.description}
              onChange={e => setRecipe({ ...recipe, description: e.target.value })}
              className="text-gray-400 text-sm bg-transparent outline-none w-full resize-none"
              rows={2}
            />
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock size={14} /> {recipe.estimatedTimeMinutes} min</span>
              <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings} pessoas</span>
              <select
                value={recipe.category}
                onChange={e => setRecipe({ ...recipe, category: e.target.value })}
                className="bg-gray-800 rounded-lg px-2 py-1 text-xs border border-gray-700 outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="font-semibold mb-3 text-gray-300">Ingredientes</h3>
            <ul className="space-y-2">
              {recipe.ingredients?.map((ing: any, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#315675' }} />
                  <span className="text-gray-300">{ing.amount} {ing.unit} {ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="font-semibold mb-3 text-gray-300">Passos</h3>
            <ol className="space-y-3">
              {recipe.steps?.map((step: any) => (
                <li key={step.order} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: '#315675' }}>
                    {step.order}
                  </span>
                  <span className="text-gray-300 pt-0.5">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Save options */}
          <div className="flex items-center justify-between bg-gray-900 rounded-xl p-4 border border-gray-800">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${isPublic ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {isPublic ? <Globe size={16} /> : <Lock size={16} />}
              {isPublic ? 'Pública' : 'Privada'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
              style={{ background: '#315675' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Guardar receita
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
