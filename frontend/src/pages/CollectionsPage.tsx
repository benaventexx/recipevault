import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import UpgradeModal from '../components/UpgradeModal'
import toast from 'react-hot-toast'
import {
  Globe, Lock, Plus, Copy, ChevronRight, Loader2, X, BookOpen, Trash2
} from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string
  isPublic: boolean
  recipeIds: string[]
  shareSlug: string
  createdAt: any
}

export default function CollectionsPage() {
  const { userData } = useAuthStore()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [upgradeType, setUpgradeType] = useState<'COLLECTIONS_LIMIT' | 'PRIVATE_COLLECTIONS' | null>(null)

  const [form, setForm] = useState({ name: '', description: '', isPublic: true })
  const [creating, setCreating] = useState(false)

  const [expanded, setExpanded] = useState<string | null>(null)
  const [colRecipes, setColRecipes] = useState<Record<string, any[]>>({})

  useEffect(() => {
    api.get('/api/collections')
      .then(r => setCollections(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Insere um nome para a coleção'); return }
    setCreating(true)
    try {
      const { data } = await api.post('/api/collections', form)
      const newCol = { ...form, id: data.id, recipeIds: [], shareSlug: '', createdAt: null }
      setCollections(prev => [newCol as Collection, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '', isPublic: true })
      toast.success('Coleção criada!')
      // Refresh to get shareSlug
      api.get('/api/collections').then(r => setCollections(r.data))
    } catch (err: any) {
      const code = err.response?.data?.code
      if (code === 'COLLECTIONS_LIMIT') setUpgradeType('COLLECTIONS_LIMIT')
      else if (code === 'PRIVATE_COLLECTIONS') setUpgradeType('PRIVATE_COLLECTIONS')
      else toast.error(err.response?.data?.error || 'Erro ao criar coleção')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta coleção?')) return
    try {
      await api.delete(`/api/collections/${id}`)
      setCollections(prev => prev.filter(c => c.id !== id))
      toast.success('Coleção eliminada')
    } catch {
      toast.error('Erro ao eliminar coleção')
    }
  }

  const copyShareLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`)
    toast.success('Link copiado!')
  }

  const loadColRecipes = async (col: Collection) => {
    if (colRecipes[col.id] || col.recipeIds.length === 0) return
    const recipes = await Promise.all(
      col.recipeIds.slice(0, 6).map(rid => api.get(`/api/recipes/${rid}`).then(r => r.data).catch(() => null))
    )
    setColRecipes(prev => ({ ...prev, [col.id]: recipes.filter(Boolean) }))
  }

  const toggleExpanded = (col: Collection) => {
    const next = expanded === col.id ? null : col.id
    setExpanded(next)
    if (next) loadColRecipes(col)
  }

  const handlePrivateToggle = () => {
    if (userData?.plan === 'free' && form.isPublic) {
      setUpgradeType('PRIVATE_COLLECTIONS')
      return
    }
    setForm(f => ({ ...f, isPublic: !f.isPublic }))
  }

  return (
    <div>
      {upgradeType && <UpgradeModal type={upgradeType} onClose={() => setUpgradeType(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">As minhas coleções</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#315675' }}
        >
          <Plus size={16} /> Nova coleção
        </button>
      </div>

      {/* Plan indicator */}
      {userData?.plan === 'free' && (
        <div className="mb-5 flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm">
          <span className="text-gray-400">
            Coleções: <span className="text-white font-medium">{collections.length}/2</span> no plano gratuito
          </span>
          <Link to="/pricing" className="text-xs font-medium hover:underline" style={{ color: '#d8cfbe' }}>
            Fazer upgrade →
          </Link>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">Nova coleção</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Nome *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Receitas de verão"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descrição opcional..."
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Visibilidade</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isPublic: true }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-colors ${form.isPublic ? 'border-gray-500 text-white bg-gray-800' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
                  >
                    <Globe size={14} /> Pública
                  </button>
                  <button
                    type="button"
                    onClick={handlePrivateToggle}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-colors ${!form.isPublic ? 'border-gray-500 text-white bg-gray-800' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
                  >
                    <Lock size={14} /> Privada {userData?.plan === 'free' && <span className="text-xs text-gray-600">(Pro)</span>}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#315675' }}
                >
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  Criar coleção
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-3 rounded-xl text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collections list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-500" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
          <p>Ainda não tens coleções.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: '#d8cfbe' }}
          >
            Criar a primeira
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map(col => (
            <div key={col.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{col.name}</span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${col.isPublic ? 'bg-green-900/30 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                        {col.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                        {col.isPublic ? 'Pública' : 'Privada'}
                      </span>
                    </div>
                    {col.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{col.description}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{col.recipeIds.length} receita{col.recipeIds.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {col.isPublic && col.shareSlug && (
                      <button
                        onClick={() => copyShareLink(col.shareSlug)}
                        className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors"
                        title="Copiar link partilhável"
                      >
                        <Copy size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="p-2 text-gray-600 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => toggleExpanded(col)}
                      className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors"
                    >
                      <ChevronRight size={16} className={`transition-transform ${expanded === col.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {expanded === col.id && (
                <div className="border-t border-gray-800 p-4">
                  {col.recipeIds.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-4">
                      Sem receitas. Adiciona receitas a partir da página de detalhe.
                    </p>
                  ) : colRecipes[col.id] === undefined ? (
                    <div className="flex justify-center py-4">
                      <Loader2 size={18} className="animate-spin text-gray-600" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {colRecipes[col.id].map(r => (
                        <Link
                          key={r.id}
                          to={`/receita/${r.id}`}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          <span className="flex-1 truncate">{r.title}</span>
                          <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                  {col.isPublic && col.shareSlug && (
                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate">/c/{col.shareSlug}</span>
                      <button
                        onClick={() => copyShareLink(col.shareSlug)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy size={12} /> Copiar link
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
