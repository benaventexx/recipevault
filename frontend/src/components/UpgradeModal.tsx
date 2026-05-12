import { X, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

type LimitType = 'EXTRACTION_LIMIT' | 'RECIPES_LIMIT' | 'COLLECTIONS_LIMIT' | 'PRIVATE_COLLECTIONS'

const MESSAGES: Record<LimitType, { title: string; description: string }> = {
  EXTRACTION_LIMIT: {
    title: 'Limite de extrações atingido',
    description: 'O plano gratuito permite 5 extrações de vídeo por mês. Faz upgrade para Pro e extrai receitas sem limites.',
  },
  RECIPES_LIMIT: {
    title: 'Limite de receitas atingido',
    description: 'O plano gratuito permite guardar até 10 receitas. Faz upgrade para Pro e guarda receitas ilimitadas.',
  },
  COLLECTIONS_LIMIT: {
    title: 'Limite de coleções atingido',
    description: 'O plano gratuito permite criar até 2 coleções. Faz upgrade para Pro e organiza sem limites.',
  },
  PRIVATE_COLLECTIONS: {
    title: 'Coleções privadas são Pro',
    description: 'No plano gratuito todas as coleções são públicas. Faz upgrade para Pro para criar coleções privadas.',
  },
}

interface Props {
  type: LimitType
  onClose: () => void
}

export default function UpgradeModal({ type, onClose }: Props) {
  const { title, description } = MESSAGES[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#315675' }}>
            <Zap size={20} className="text-white" />
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>

        <div className="flex gap-3">
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center text-white transition-opacity hover:opacity-90"
            style={{ background: '#315675' }}
          >
            Ver planos
          </Link>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
