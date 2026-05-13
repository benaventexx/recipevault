import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { CheckCircle, Clock, Filter } from 'lucide-react'

const CATEGORIES = ['todos', 'vegetais', 'carne', 'peixe', 'entradas', 'sobremesas', 'massa', 'sopa', 'outro']
const CATEGORY_EMOJI: Record<string, string> = {
  todos: '🍽️', vegetais: '🥦', carne: '🥩', peixe: '🐟',
  entradas: '🍢', sobremesas: '🍮', massa: '🍝', sopa: '🍲', outro: '🍽️',
}

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [category, setCategory] = useState('todos')
  const [showDone, setShowDone] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params: any = {}
    if (category !== 'todos') params.category = category
    if (showDone !== null) params.done = showDone
    api.get('/api/recipes', { params })
      .then(r => setRecipes(r.data))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [category, showDone])

  const toggleDone = async (id: string, current: boolean) => {
    await api.patch(`/api/recipes/${id}/done`)
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, isDone: !current } : r))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">As minhas receitas</h1>
        <Link to="/adicionar" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#315675' }}>
          + Adicionar
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
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
        <button
          onClick={() => setShowDone(showDone === null ? false : showDone === false ? true : null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors border ${showDone === null ? 'border-gray-800 bg-gray-900 text-gray-400' : 'border-green-700 bg-green-900/30 text-green-400'}`}
        >
          <CheckCircle size={14} />
          {showDone === null ? 'Todas' : showDone ? 'Já feitas' : 'Por fazer'}
        </button>
      </div>

      {/* Recipe grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">A carregar...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhuma receita encontrada.</p>
          <Link to="/adicionar" className="text-sm mt-2 inline-block" style={{ color: '#315675' }}>Adicionar a primeira</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-colors">
              <Link to={`/receita/${recipe.id}`} className="block p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-snug">{recipe.title}</h3>
                  {recipe.isDone && <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />}
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{recipe.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Clock size={12} /> {recipe.estimatedTimeMinutes}min</span>
                  <span className="px-2 py-0.5 bg-gray-800 rounded-full">{recipe.category}</span>
                </div>
              </Link>
              <div className="border-t border-gray-800 px-4 py-2">
                <button
                  onClick={() => toggleDone(recipe.id, recipe.isDone)}
                  className={`text-xs transition-colors ${recipe.isDone ? 'text-green-500' : 'text-gray-500 hover:text-green-400'}`}
                >
                  {recipe.isDone ? '✓ Já fiz esta receita' : 'Marcar como feita'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
