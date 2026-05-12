import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyRecipesPage from './pages/MyRecipesPage'
import AddRecipePage from './pages/AddRecipePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import CollectionsPage from './pages/CollectionsPage'
import PublicCollectionPage from './pages/PublicCollectionPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500" style={{ background: '#030712' }}>A carregar...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function HomeRoute() {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500" style={{ background: '#030712' }}>A carregar...</div>
  if (user) return <Navigate to="/minhas-receitas" replace />
  return <HomePage />
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: '#030712' }}>
      <p className="text-7xl font-bold text-gray-800 mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-8">A página que procuras não existe ou foi removida.</p>
      <a href="/" className="px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#315675' }}>
        Voltar ao início
      </a>
    </div>
  )
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151', fontSize: '14px' },
          duration: 3000,
        }}
      />
      <Routes>
        {/* Standalone pages (no Layout wrapper) */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<HomePage />} />
        <Route path="/c/:slug" element={<PublicCollectionPage />} />

        {/* Pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/minhas-receitas" element={<ProtectedRoute><MyRecipesPage /></ProtectedRoute>} />
          <Route path="/adicionar" element={<ProtectedRoute><AddRecipePage /></ProtectedRoute>} />
          <Route path="/receita/:id" element={<RecipeDetailPage />} />
          <Route path="/colecoes" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
          <Route path="/perfil/:id" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
