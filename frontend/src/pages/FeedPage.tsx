import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Clock, Search, Loader2, Zap, ChevronRight } from 'lucide-react'

const CATEGORIES = ['todos', 'vegetais', 'carne', 'peixe', 'entradas', 'sobremesas', 'massa', 'sopa', 'outro']
const CATEGORY_EMOJI: Record<string, string> = {
  todos: '🍽️', vegetais: '🥦', carne: '🥩', peixe: '🐟',
  entradas: '🍢', sobremesas: '🍮', massa: '🍝', sopa: '🍲', outro: '🍽️',
}

export default function FeedPage() {
  const { user, userData } = useAuthStore()
  const [recipes, setRecipes] = useState<any[]>([])
  const [category, setCategory] = useState('todos')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const isPro = userData?.plan === 'pro'
  const showGate = user && !isPro

  useEffect(() => {
    if (!user || !isPro) { setLoading(false); return }
    setLoading(true)
    const params: any = {}
    if (category !== 'todos') params.category = category
    api.get('/api/feed', { params })
      .then(r => setRecipes(r.data))
      .finally(() => setLoading(false))
  }, [category, user, isPro])

  const filtered = recipes.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase())
  )

  // Unauthenticated users see landing
  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-3">Descobre receitas</h2>
        <p className="text-gray-400 mb-6">Entra para explorar receitas públicas de outros utilizadores.</p>
        <Link to="/login" className="px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#315675' }}>
          Entrar
        </Link>
      </div>
    )
  }

  // Free plan gate
  if (showGate) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#315675' }}>
          <Zap size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Feed de descoberta</h2>
        <p className="text-gray-400 mb-2 leading-relaxed">
          Explora receitas públicas partilhadas por outros utilizadores — filtradas por categoria e pesquisáveis.
        </p>
        <p className="text-gray-500 text-sm mb-8">Esta funcionalidade está disponível no plano Pro.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/pricing"
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#315675' }}
          >
            Ver planos — €4.99/mês
          </Link>
          <Link to="/minhas-receitas" className="px-8 py-3 rounded-xl text-sm border border-gray-700 text-gray-400 hover:text-white transition-colors">
            As minhas receitas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Descobrir receitas</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por título..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${category === c ? 'text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}
              style={category === c ? { background: '#315675' } : {}}
            >
              {CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>Nenhuma receita encontrada.</p>
          {search && (
            <button onClick={() => setSearch('')} className="text-sm mt-2 underline" style={{ color: '#d8cfbe' }}>
              Limpar pesquisa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(recipe => (
            <Link
              key={recipe.id}
              to={`/receita/${recipe.id}`}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-600 transition-colors block"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-sm leading-snug">{recipe.title}</h3>
                <ChevronRight size={14} className="text-gray-600 flex-shrink-0 mt-0.5" />
              </div>
              {recipe.description && (
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{recipe.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                {recipe.estimatedTimeMinutes && (
                  <span className="flex items-center gap-1"><Clock size={11} /> {recipe.estimatedTimeMinutes}min</span>
                )}
                {recipe.category && (
                  <span className="px-2 py-0.5 bg-gray-800 rounded-full">
                    {CATEGORY_EMOJI[recipe.category]} {recipe.category}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
