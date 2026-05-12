import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { Clock, BookOpen, Globe, Loader2, ChevronRight } from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = {
  vegetais: '🥦', carne: '🥩', peixe: '🐟',
  entradas: '🍢', sobremesas: '🍮', massa: '🍝', sopa: '🍲', outro: '🍽️',
}

export default function PublicCollectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const [collection, setCollection] = useState<any>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [owner, setOwner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/collections/public/${slug}`)
      .then(async ({ data }) => {
        setCollection(data)

        // Load recipes
        const loaded = await Promise.all(
          (data.recipeIds || []).map((rid: string) =>
            api.get(`/api/recipes/${rid}`).then(r => r.data).catch(() => null)
          )
        )
        setRecipes(loaded.filter(Boolean))

        // Load owner profile
        try {
          const { data: profile } = await api.get(`/api/users/${data.userId}/profile`)
          setOwner(profile)
        } catch {}
      })
      .catch(() => setError('Coleção não encontrada ou não está pública'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <Loader2 size={28} className="animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: '#030712' }}>
        <BookOpen size={40} className="text-gray-700 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Coleção não encontrada</h1>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#315675' }}>
          Ir para o início
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#030712' }}>
      {/* Simple header */}
      <header className="border-b border-gray-900 px-4 h-14 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-tight" style={{ color: '#d8cfbe', fontFamily: 'Georgia, serif' }}>
            RecipeVault
          </Link>
          <Link to="/login" className="px-4 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: '#315675' }}>
            Entrar
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Collection header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Globe size={12} /> Coleção pública
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-gray-400 mb-4">{collection.description}</p>
          )}
          {owner && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {owner.photoURL
                ? <img src={owner.photoURL} alt="" className="w-6 h-6 rounded-full" />
                : <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-400">
                    {owner.displayName?.[0]?.toUpperCase() || '?'}
                  </div>
              }
              <span>por</span>
              <Link to={`/perfil/${owner.id}`} className="font-medium text-gray-300 hover:text-white transition-colors">
                {owner.displayName || 'Utilizador'}
              </Link>
              <span>·</span>
              <span>{recipes.length} receita{recipes.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Recipes grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p>Esta coleção ainda não tem receitas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {recipes.map(recipe => (
              <Link
                key={recipe.id}
                to={`/receita/${recipe.id}`}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-600 transition-colors block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-snug text-white">{recipe.title}</h3>
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

        {/* CTA */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Guarda as tuas próprias receitas
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Cola qualquer link do YouTube, TikTok ou Instagram e a IA extrai a receita automaticamente.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#315675' }}
          >
            Criar conta grátis
          </Link>
          <p className="text-xs text-gray-600 mt-3">Gratuito. Sem cartão de crédito.</p>
        </div>
      </div>
    </div>
  )
}
