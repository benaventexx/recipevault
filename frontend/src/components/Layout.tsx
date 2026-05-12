import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { BookOpen, Plus, Grid, Compass, LogOut, Zap } from 'lucide-react'

export default function Layout() {
  const { user, userData, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isFree = user && userData?.plan === 'free'
  const extractionPct = isFree ? Math.min((userData!.extractionsThisMonth / 5) * 100, 100) : 0
  const recipesPct = isFree ? Math.min((userData!.recipesCount / 10) * 100, 100) : 0

  return (
    <div className="min-h-screen text-white" style={{ background: '#030712' }}>
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <NavLink to="/" className="font-bold text-xl tracking-tight flex-shrink-0" style={{ color: '#d8cfbe', fontFamily: 'Georgia, serif' }}>
            RecipeVault
          </NavLink>

          {/* Free plan usage indicator */}
          {isFree && (
            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs mx-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Extrações {userData!.extractionsThisMonth}/5</span>
                  <span>Receitas {userData!.recipesCount}/10</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden flex gap-1">
                  <div className="flex-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${extractionPct}%`, background: '#315675' }} />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${recipesPct}%`, background: '#315675' }} />
                  </div>
                </div>
              </div>
              <Link
                to="/pricing"
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 transition-opacity hover:opacity-80"
                style={{ background: '#315675' }}
              >
                <Zap size={11} /> Pro
              </Link>
            </div>
          )}

          <nav className="flex items-center gap-1 flex-shrink-0">
            <NavLink
              to="/feed"
              className={({ isActive }) => `p-2 rounded-lg transition-colors ${isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              title="Descobrir"
            >
              <Compass size={20} />
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/minhas-receitas"
                  className={({ isActive }) => `p-2 rounded-lg transition-colors ${isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
                  title="As minhas receitas"
                >
                  <BookOpen size={20} />
                </NavLink>
                <NavLink
                  to="/colecoes"
                  className={({ isActive }) => `p-2 rounded-lg transition-colors ${isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
                  title="Coleções"
                >
                  <Grid size={20} />
                </NavLink>
                <NavLink
                  to="/adicionar"
                  className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
                  style={{ background: '#315675' }}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Adicionar</span>
                </NavLink>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors" title="Sair">
                  <LogOut size={20} />
                </button>
              </>
            )}
            {!user && (
              <NavLink to="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#315675' }}>
                Entrar
              </NavLink>
            )}
          </nav>
        </div>

        {/* Mobile free usage bar */}
        {isFree && (
          <div className="sm:hidden border-t border-gray-800/50 px-4 py-1.5 flex items-center gap-3">
            <div className="flex-1 text-xs text-gray-600">
              Extrações: {userData!.extractionsThisMonth}/5 · Receitas: {userData!.recipesCount}/10
            </div>
            <Link to="/pricing" className="text-xs font-medium flex-shrink-0" style={{ color: '#d8cfbe' }}>
              Upgrade →
            </Link>
          </div>
        )}
      </header>

      {/* Content — extra top padding if mobile usage bar is visible */}
      <main className={`max-w-6xl mx-auto px-4 py-6 ${isFree ? 'pt-24 sm:pt-20' : 'pt-20'}`}>
        <Outlet />
      </main>
    </div>
  )
}
