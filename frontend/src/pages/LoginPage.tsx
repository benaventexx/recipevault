import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuthStore()
  const navigate = useNavigate()

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/minhas-receitas')
    } catch {
      toast.error('Erro ao entrar com Google. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        if (!name.trim()) { toast.error('Insere o teu nome'); setLoading(false); return }
        await signUpWithEmail(email, password, name)
      }
      navigate('/minhas-receitas')
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/user-not-found': 'Utilizador não encontrado',
        'auth/wrong-password': 'Password incorreta',
        'auth/invalid-credential': 'Email ou password incorretos',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'Password demasiado fraca (mínimo 6 caracteres)',
        'auth/invalid-email': 'Email inválido',
      }
      toast.error(msgs[err.code] || 'Erro ao autenticar. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#030712' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold tracking-tight" style={{ color: '#d8cfbe', fontFamily: 'Georgia, serif' }}>
            RecipeVault
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Cria a tua conta grátis'}
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-700 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">ou</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome"
                  className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-9 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
              style={{ background: '#315675' }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? 'Ainda não tens conta?' : 'Já tens conta?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-medium hover:underline"
              style={{ color: '#d8cfbe' }}
            >
              {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
            </button>
          </p>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}
