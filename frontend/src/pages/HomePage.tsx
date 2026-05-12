import { Link } from 'react-router-dom'
import { Check, X, ChevronRight, Youtube, Instagram } from 'lucide-react'

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/>
    </svg>
  )
}

const FREE_FEATURES = [
  { ok: true, text: '10 receitas guardadas' },
  { ok: true, text: '5 extrações de vídeo por mês' },
  { ok: true, text: '2 coleções (sempre públicas)' },
  { ok: false, text: 'Receitas privadas' },
  { ok: false, text: 'Feed de descoberta' },
  { ok: false, text: 'Coleções privadas' },
]

const PRO_FEATURES = [
  { ok: true, text: 'Receitas ilimitadas' },
  { ok: true, text: 'Extrações ilimitadas' },
  { ok: true, text: 'Coleções ilimitadas (públicas e privadas)' },
  { ok: true, text: 'Feed de descoberta' },
  { ok: true, text: 'Perfil público com badge Pro' },
  { ok: true, text: 'Suporte prioritário' },
]

export default function HomePage() {
  return (
    <div className="text-white" style={{ background: '#030712' }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight" style={{ color: '#d8cfbe', fontFamily: 'Georgia, serif' }}>
            RecipeVault
          </span>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Preços
            </Link>
            <Link to="/login" className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-700 hover:border-gray-500 transition-colors">
              Entrar
            </Link>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: '#315675' }}
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Novo — suporte a YouTube, TikTok e Instagram
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Georgia, serif' }}>
          Guarda receitas de qualquer vídeo{' '}
          <span style={{ color: '#d8cfbe' }}>em segundos</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Cola o link do YouTube, TikTok ou Instagram. A IA extrai tudo — ingredientes, passos, categorias.{' '}
          <span className="text-gray-300">Sem copiar, sem escrever.</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: '#315675' }}
          >
            Começar grátis <ChevronRight size={18} />
          </Link>
          <Link
            to="#como-funciona"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-medium border border-gray-700 hover:border-gray-500 transition-colors text-center"
          >
            Ver como funciona
          </Link>
        </div>

        {/* Platform icons */}
        <div className="flex items-center justify-center gap-6 mt-12 text-gray-600">
          <div className="flex items-center gap-2 text-sm">
            <Youtube size={18} className="text-red-600" /> YouTube
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TikTokIcon /> TikTok
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Instagram size={18} className="text-pink-500" /> Instagram
          </div>
        </div>
      </section>

      {/* Mock UI visual */}
      <section className="px-4 pb-20 max-w-3xl mx-auto">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-700" />
            <div className="w-3 h-3 rounded-full bg-gray-700" />
            <div className="w-3 h-3 rounded-full bg-gray-700" />
            <div className="flex-1 mx-3 bg-gray-800 rounded-md h-6 flex items-center px-3">
              <span className="text-xs text-gray-500">recipevault.app/adicionar</span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <div className="flex-1 flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-3">
                <div className="w-4 h-4 rounded bg-gray-600 flex-shrink-0" />
                <span className="text-gray-400 text-sm">https://youtube.com/watch?v=...</span>
              </div>
              <div className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-1.5" style={{ background: '#315675' }}>
                Extrair
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="font-semibold mb-1">Frango assado com ervas aromáticas</div>
                <div className="text-gray-400 text-sm mb-3">Receita clássica portuguesa com alecrim e tomilho</div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-gray-700 px-2 py-0.5 rounded-full">🥩 Carne</span>
                  <span>45 min</span>
                  <span>4 pessoas</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                  <div className="text-xs font-medium text-gray-400 mb-2">Ingredientes</div>
                  {['1 frango inteiro', '3 dentes de alho', 'Alecrim q.b.', 'Azeite 3 colheres'].map(i => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300 mb-1">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#315675' }} />
                      {i}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                  <div className="text-xs font-medium text-gray-400 mb-2">Passos</div>
                  {['Temperar o frango', 'Pré-aquecer o forno', 'Assar 45 min a 200°', 'Repouso 10 min'].map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5 text-xs text-gray-300 mb-1">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#315675', fontSize: '9px' }}>{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="px-4 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>Como funciona</h2>
          <p className="text-gray-400">Três passos e a receita está guardada</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { n: '1', icon: '🔗', title: 'Cola o link', desc: 'Qualquer vídeo do YouTube, TikTok ou Instagram com uma receita' },
            { n: '2', icon: '🤖', title: 'A IA extrai', desc: 'A inteligência artificial lê a transcrição ou legenda e estrutura a receita completa' },
            { n: '3', icon: '📚', title: 'Guarda e organiza', desc: 'Edita os detalhes, adiciona a uma coleção e partilha com quem quiseres' },
          ].map(step => (
            <div key={step.n} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-3" style={{ background: '#315675' }}>
                {step.n}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>Planos simples e honestos</h2>
          <p className="text-gray-400">Começa grátis. Upgrade só quando precisares de mais.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="mb-6">
              <div className="text-sm text-gray-400 font-medium mb-1">GRATUITO</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-gray-500">/mês</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm">
                  {f.ok
                    ? <Check size={16} className="flex-shrink-0 mt-0.5 text-green-500" />
                    : <X size={16} className="flex-shrink-0 mt-0.5 text-gray-600" />}
                  <span className={f.ok ? 'text-gray-300' : 'text-gray-600'}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl text-sm font-semibold text-center border border-gray-700 hover:border-gray-500 transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 p-6 relative" style={{ background: 'linear-gradient(135deg, #0f1f2e 0%, #0a1520 100%)', borderColor: '#315675' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: '#315675' }}>
                MAIS POPULAR
              </span>
            </div>
            <div className="mb-6">
              <div className="text-sm font-medium mb-1" style={{ color: '#d8cfbe' }}>PRO</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">€4.99</span>
                <span className="text-gray-400">/mês</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm">
                  <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#d8cfbe' }} />
                  <span className="text-gray-200">{f.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login?plan=pro"
              className="block w-full py-3 rounded-xl text-sm font-semibold text-center text-white transition-opacity hover:opacity-90"
              style={{ background: '#315675' }}
            >
              Começar Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Honest limitations */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            O que a IA consegue (e não consegue) fazer
          </h2>
          <p className="text-gray-400 text-sm mb-6">Preferimos ser honestos sobre as limitações do produto.</p>
          <div className="space-y-3">
            {[
              { ok: true, text: 'YouTube: extrai a transcrição automática — funciona muito bem na maioria dos vídeos' },
              { ok: true, text: 'TikTok e Instagram: extrai a descrição/legenda do post — funciona se o criador escrever os ingredientes' },
              { ok: false, text: 'Vídeos sem legendas ou sem descrição com receita — a IA não consegue "ver" o vídeo, só lê texto' },
              { ok: false, text: 'Receitas muito complexas ou mal descritas podem precisar de edição manual' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-3 text-sm">
                {item.ok
                  ? <Check size={16} className="flex-shrink-0 mt-0.5 text-green-500" />
                  : <X size={16} className="flex-shrink-0 mt-0.5 text-red-500" />}
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-500 bg-gray-800 rounded-xl p-3">
            💡 Podes sempre editar a receita após a extração antes de guardar — os campos são todos editáveis.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <span style={{ fontFamily: 'Georgia, serif', color: '#d8cfbe' }}>RecipeVault</span>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-gray-400 transition-colors">Início</Link>
            <Link to="/pricing" className="hover:text-gray-400 transition-colors">Preços</Link>
            <Link to="/login" className="hover:text-gray-400 transition-colors">Entrar</Link>
            <a href="#" className="hover:text-gray-400 transition-colors">Termos</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Privacidade</a>
          </div>
          <span>RecipeVault © 2025</span>
        </div>
      </footer>
    </div>
  )
}
