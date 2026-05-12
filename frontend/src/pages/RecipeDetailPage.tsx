import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  Clock, Users, CheckCircle, Edit2, Trash2, Share2, Timer,
  ExternalLink, Loader2, X, Check, ChevronDown, Globe, Lock, ArrowLeft
} from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = {
  vegetais: '🥦', carne: '🥩', peixe: '🐟',
  entradas: '🍢', sobremesas: '🍮', massa: '🍝', sopa: '🍲', outro: '🍽️',
}
const CATEGORIES = ['vegetais', 'carne', 'peixe', 'entradas', 'sobremesas', 'massa', 'sopa', 'outro']

function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining(r => {
        if (r <= 1) { setRunning(false); clearInterval(intervalRef.current!); toast.success('Tempo esgotado!'); return 0 }
        return r - 1
      }), 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <button
      onClick={() => { if (remaining === 0) setRemaining(seconds); setRunning(r => !r) }}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-colors ${running ? 'border-orange-600 text-orange-400 bg-orange-900/20' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
    >
      <Timer size={12} />
      {mm}:{ss}
    </button>
  )
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [collections, setCollections] = useState<any[]>([])
  const [showCollections, setShowCollections] = useState(false)
  const [addingToCol, setAddingToCol] = useState<string | null>(null)

  const isOwner = user && recipe && user.uid === recipe.userId

  useEffect(() => {
    api.get(`/api/recipes/${id}`)
      .then(r => { setRecipe(r.data); setDraft(r.data) })
      .catch(err => {
        if (err.response?.status === 404) toast.error('Receita não encontrada')
        else if (err.response?.status === 403) toast.error('Não tens acesso a esta receita')
        else toast.error('Erro ao carregar receita')
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user && showCollections && collections.length === 0) {
      api.get('/api/collections').then(r => setCollections(r.data))
    }
  }, [showCollections, user])

  const toggleDone = async () => {
    try {
      const { data } = await api.patch(`/api/recipes/${id}/done`)
      setRecipe((r: any) => ({ ...r, isDone: data.isDone }))
      toast.success(data.isDone ? 'Marcada como feita!' : 'Desmarcada')
    } catch {
      toast.error('Erro ao actualizar estado')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/api/recipes/${id}`, draft)
      setRecipe(draft)
      setEditing(false)
      toast.success('Receita guardada!')
    } catch {
      toast.error('Erro ao guardar alterações')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tens a certeza que queres eliminar esta receita?')) return
    setDeleting(true)
    try {
      await api.delete(`/api/recipes/${id}`)
      toast.success('Receita eliminada')
      navigate('/minhas-receitas')
    } catch {
      toast.error('Erro ao eliminar receita')
      setDeleting(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiado!')
  }

  const togglePublic = async () => {
    try {
      await api.put(`/api/recipes/${id}`, { isPublic: !recipe.isPublic })
      setRecipe((r: any) => ({ ...r, isPublic: !r.isPublic }))
      setDraft((d: any) => ({ ...d, isPublic: !d.isPublic }))
      toast.success(recipe.isPublic ? 'Receita tornada privada' : 'Receita tornada pública')
    } catch {
      toast.error('Erro ao alterar visibilidade')
    }
  }

  const handleAddToCollection = async (colId: string) => {
    setAddingToCol(colId)
    try {
      await api.post(`/api/collections/${colId}/recipes`, { recipeId: id })
      toast.success('Adicionada à coleção!')
      setShowCollections(false)
    } catch {
      toast.error('Erro ao adicionar à coleção')
    } finally {
      setAddingToCol(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-gray-500" />
      </div>
    )
  }
  if (!recipe) return null

  const displayData = editing ? draft : recipe

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white mb-5 transition-colors">
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Header card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-4">
        {editing ? (
          <>
            <input
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              className="text-xl font-bold bg-transparent border-b border-gray-700 focus:border-gray-500 outline-none w-full pb-1 mb-2"
            />
            <textarea
              value={draft.description}
              onChange={e => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              className="text-gray-400 text-sm bg-transparent outline-none w-full resize-none"
            />
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-xl font-bold flex-1 leading-snug">{recipe.title}</h1>
              {recipe.isDone && <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />}
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">{recipe.description}</p>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
          {displayData.estimatedTimeMinutes && (
            <span className="flex items-center gap-1.5"><Clock size={14} /> {displayData.estimatedTimeMinutes} min</span>
          )}
          {displayData.servings && (
            <span className="flex items-center gap-1.5"><Users size={14} /> {displayData.servings} pessoas</span>
          )}
          {editing ? (
            <select
              value={draft.category}
              onChange={e => setDraft({ ...draft, category: e.target.value })}
              className="bg-gray-800 rounded-lg px-2 py-1 text-xs border border-gray-700 outline-none text-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          ) : (
            <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs">
              {CATEGORY_EMOJI[recipe.category]} {recipe.category}
            </span>
          )}
          {recipe.videoSource && (
            <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors ml-auto">
              <ExternalLink size={12} /> {recipe.videoSource}
            </a>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {isOwner && (
          <>
            <button
              onClick={toggleDone}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors border ${recipe.isDone ? 'border-green-700 bg-green-900/20 text-green-400' : 'border-gray-700 text-gray-400 hover:text-white'}`}
            >
              <CheckCircle size={15} />
              {recipe.isDone ? 'Já fiz esta receita' : 'Marcar como feita'}
            </button>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: '#315675' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Guardar
                </button>
                <button onClick={() => { setEditing(false); setDraft(recipe) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors">
                  <X size={14} /> Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Edit2 size={14} /> Editar
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-red-900 text-red-500 hover:bg-red-900/20 transition-colors disabled:opacity-50">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Eliminar
                </button>
              </>
            )}
          </>
        )}
        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors">
          <Share2 size={14} /> Partilhar
        </button>
        {user && !editing && (
          <div className="relative">
            <button onClick={() => setShowCollections(s => !s)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors">
              Adicionar a coleção <ChevronDown size={14} />
            </button>
            {showCollections && (
              <div className="absolute right-0 mt-1 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
                {collections.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Sem coleções. <Link to="/colecoes" className="underline" style={{ color: '#d8cfbe' }}>Criar uma</Link>
                  </div>
                ) : collections.map(col => (
                  <button key={col.id}
                    onClick={() => handleAddToCollection(col.id)}
                    disabled={addingToCol === col.id}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-800 transition-colors text-left disabled:opacity-50">
                    <span className="truncate">{col.name}</span>
                    {col.isPublic ? <Globe size={12} className="text-gray-600" /> : <Lock size={12} className="text-gray-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {isOwner && !editing && (
          <button
            onClick={togglePublic}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors ml-auto"
          >
            {recipe.isPublic ? <Globe size={14} /> : <Lock size={14} />}
            {recipe.isPublic ? 'Pública' : 'Privada'}
          </button>
        )}
      </div>

      {/* Ingredients */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-4">
        <h2 className="font-semibold text-gray-200 mb-4">Ingredientes</h2>
        {editing ? (
          <div className="space-y-2">
            {draft.ingredients?.map((ing: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input value={ing.amount} onChange={e => {
                  const ings = [...draft.ingredients]; ings[i] = { ...ing, amount: e.target.value }; setDraft({ ...draft, ingredients: ings })
                }} placeholder="Qtd." className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none text-white" />
                <input value={ing.unit} onChange={e => {
                  const ings = [...draft.ingredients]; ings[i] = { ...ing, unit: e.target.value }; setDraft({ ...draft, ingredients: ings })
                }} placeholder="Un." className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none text-white" />
                <input value={ing.name} onChange={e => {
                  const ings = [...draft.ingredients]; ings[i] = { ...ing, name: e.target.value }; setDraft({ ...draft, ingredients: ings })
                }} placeholder="Ingrediente" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none text-white" />
                <button onClick={() => setDraft({ ...draft, ingredients: draft.ingredients.filter((_: any, j: number) => j !== i) })}
                  className="text-gray-600 hover:text-red-400 transition-colors px-1"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => setDraft({ ...draft, ingredients: [...(draft.ingredients || []), { name: '', amount: '', unit: '' }] })}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors mt-1">+ Adicionar ingrediente</button>
          </div>
        ) : (
          <ul className="space-y-2">
            {recipe.ingredients?.map((ing: any, i: number) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#315675' }} />
                <span className="text-gray-300">
                  {ing.amount && <span className="font-medium">{ing.amount} </span>}
                  {ing.unit && <span className="text-gray-500">{ing.unit} </span>}
                  {ing.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Steps */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="font-semibold text-gray-200 mb-4">Passos</h2>
        {editing ? (
          <div className="space-y-3">
            {draft.steps?.map((step: any, i: number) => (
              <div key={i} className="flex gap-2">
                <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1.5" style={{ background: '#315675' }}>
                  {step.order}
                </span>
                <textarea
                  value={step.text}
                  onChange={e => {
                    const steps = [...draft.steps]; steps[i] = { ...step, text: e.target.value }; setDraft({ ...draft, steps })
                  }}
                  rows={2}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none text-white resize-none"
                />
                <button onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_: any, j: number) => j !== i).map((s: any, idx: number) => ({ ...s, order: idx + 1 })) })}
                  className="text-gray-600 hover:text-red-400 transition-colors self-start mt-2 px-1"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => setDraft({ ...draft, steps: [...(draft.steps || []), { order: (draft.steps?.length || 0) + 1, text: '' }] })}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors">+ Adicionar passo</button>
          </div>
        ) : (
          <ol className="space-y-4">
            {recipe.steps?.map((step: any) => (
              <li key={step.order} className="flex gap-3">
                <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: '#315675' }}>
                  {step.order}
                </span>
                <div className="flex-1 pt-0.5">
                  <p className="text-gray-300 text-sm leading-relaxed">{step.text}</p>
                  {step.timerSeconds && (
                    <div className="mt-2">
                      <StepTimer seconds={step.timerSeconds} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Tags */}
      {recipe.tags?.length > 0 && !editing && (
        <div className="flex flex-wrap gap-2 mt-4">
          {recipe.tags.map((tag: string) => (
            <span key={tag} className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
