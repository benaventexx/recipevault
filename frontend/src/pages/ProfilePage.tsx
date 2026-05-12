import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Clock, BookOpen, Loader2, Globe, ChevronRight, UserPlus, Check, Zap } from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = {
  vegetais: '🥦', carne: '🥩', peixe: '🐟',
  entradas: '🍢', sobremesas: '🍮', massa: '🍝', sopa: '🍲', outro: '🍽️',
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user, userData } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [tab, setTab] = useState<'receitas' | 'colecoes'>('receitas')

  const isOwnProfile = user?.uid === id

  useEffect(() => {
    api.get(`/api/users/${id}/profile`)
      .then(({ data }) => {
        setProfile(data)
        if (userData?.following?.includes(id!)) setFollowing(true)
      })
      .catch(() => toast.error('Perfil não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const handleFollow = async () => {
    if (!user) { toast.error('Tens de estar autenticado'); return }
    setFollowLoading(true)
    try {
      await api.post(`/api/users/${id}/follow`)
      setFollowing(true)
      toast.success(`A seguir ${profile.displayName || 'utilizador'}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao seguir utilizador')
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-gray-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Perfil não encontrado.</p>
        <Link to="/" className="text-sm mt-3 inline-block" style={{ color: '#d8cfbe' }}>← Voltar</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex items-start gap-4">
          {profile.photoURL
            ? <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-full flex-shrink-0" />
            : (
              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold" style={{ background: '#315675' }}>
                {profile.displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profile.displayName || 'Utilizador'}</h1>
              {profile.plan === 'pro' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: '#315675' }}>
                  <Zap size={10} /> Pro
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{profile.recipes?.length || 0} receita{profile.recipes?.length !== 1 ? 's' : ''}</span>
              <span>{profile.collections?.length || 0} coleção{profile.collections?.length !== 1 ? 'ões' : ''}</span>
            </div>
          </div>
          {!isOwnProfile && user && (
            <button
              onClick={handleFollow}
              disabled={following || followLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${following ? 'bg-gray-800 text-gray-400' : 'text-white'}`}
              style={!following ? { background: '#315675' } : {}}
            >
              {followLoading ? <Loader2 size={14} className="animate-spin" /> : following ? <Check size={14} /> : <UserPlus size={14} />}
              {following ? 'A seguir' : 'Seguir'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-5">
        <button
          onClick={() => setTab('receitas')}
          className={`pb-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${tab === 'receitas' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Receitas ({profile.recipes?.length || 0})
        </button>
        <button
          onClick={() => setTab('colecoes')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === 'colecoes' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Coleções ({profile.collections?.length || 0})
        </button>
      </div>

      {tab === 'receitas' && (
        profile.recipes?.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <BookOpen size={28} className="mx-auto mb-3 opacity-40" />
            <p>Sem receitas públicas ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.recipes?.map((recipe: any) => (
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
        )
      )}

      {tab === 'colecoes' && (
        profile.collections?.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Globe size={28} className="mx-auto mb-3 opacity-40" />
            <p>Sem coleções públicas ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.collections?.map((col: any) => (
              <Link
                key={col.id}
                to={`/c/${col.shareSlug}`}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-600 transition-colors block"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm">{col.name}</h3>
                  <ChevronRight size={14} className="text-gray-600 flex-shrink-0 mt-0.5" />
                </div>
                {col.description && (
                  <p className="text-gray-500 text-xs line-clamp-2 mb-2">{col.description}</p>
                )}
                <p className="text-xs text-gray-600">{col.recipeIds?.length || 0} receitas</p>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}
