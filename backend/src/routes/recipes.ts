import { Router } from 'express'
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth'
import { detectSource, extractVideoText } from '../services/videoExtractor'
import { extractRecipeFromText } from '../services/aiExtractor'
import { db } from '../lib/firebase'
import { FieldValue } from 'firebase-admin/firestore'

export const recipesRouter = Router()

async function getUserPlanData(userId: string) {
  const doc = await db.collection('users').doc(userId).get()
  const data = doc.data() || {}
  const plan = data.plan || 'free'
  const now = new Date()
  const resetDate: Date | null = data.extractionsResetDate?.toDate?.() ?? null

  let extractionsThisMonth = data.extractionsThisMonth ?? 0
  if (!resetDate || now >= resetDate) {
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    await db.collection('users').doc(userId).set({
      extractionsThisMonth: 0,
      extractionsResetDate: nextReset,
      plan: plan,
    }, { merge: true })
    extractionsThisMonth = 0
  }

  return { plan, extractionsThisMonth, recipesCount: data.recipesCount ?? 0 }
}

// POST /api/recipes/extract — extract recipe from video URL (no save yet)
recipesRouter.post('/extract', requireAuth, async (req: AuthRequest, res) => {
  const { url, language } = req.body
  if (!url) return res.status(400).json({ error: 'URL é obrigatório' })

  try {
    const { plan, extractionsThisMonth } = await getUserPlanData(req.userId!)

    if (plan === 'free' && extractionsThisMonth >= 5) {
      return res.status(402).json({
        error: `Atingiste o limite de 5 extrações por mês no plano gratuito. Faz upgrade para Pro.`,
        code: 'EXTRACTION_LIMIT',
        used: extractionsThisMonth,
        limit: 5,
      })
    }

    const source = detectSource(url)
    const text = await extractVideoText(url, source)
    const recipe = await extractRecipeFromText(text, language || 'pt')

    await db.collection('users').doc(req.userId!).update({
      extractionsThisMonth: FieldValue.increment(1),
    })

    res.json({ ...recipe, videoUrl: url, videoSource: source })
  } catch (err: any) {
    if (err.status === 402) return res.status(402).json(err)
    res.status(400).json({ error: err.message })
  }
})

// POST /api/recipes — save recipe
recipesRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { plan, recipesCount } = await getUserPlanData(req.userId!)

    if (plan === 'free' && recipesCount >= 10) {
      return res.status(402).json({
        error: 'Atingiste o limite de 10 receitas no plano gratuito. Faz upgrade para Pro.',
        code: 'RECIPES_LIMIT',
        used: recipesCount,
        limit: 10,
      })
    }

    const data = req.body
    const ref = await db.collection('recipes').add({
      ...data,
      userId: req.userId,
      isDone: false,
      isPublic: data.isPublic ?? false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    await db.collection('users').doc(req.userId!).update({
      recipesCount: FieldValue.increment(1),
    })

    res.json({ id: ref.id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/recipes — get user's recipes
recipesRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { category, done } = req.query
  try {
    let query = db.collection('recipes').where('userId', '==', req.userId)
    if (category) query = query.where('category', '==', category)
    if (done !== undefined) query = query.where('isDone', '==', done === 'true')
    const snap = await query.get()
    const recipes = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
    res.json(recipes)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/recipes/:id — public recipes accessible without auth
recipesRouter.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  const doc = await db.collection('recipes').doc(req.params.id).get()
  if (!doc.exists) return res.status(404).json({ error: 'Receita não encontrada' })
  const data = doc.data()!
  if (!data.isPublic && data.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  res.json({ id: doc.id, ...data })
})

// PUT /api/recipes/:id
recipesRouter.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('recipes').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  await ref.update({ ...req.body, updatedAt: FieldValue.serverTimestamp() })
  res.json({ success: true })
})

// DELETE /api/recipes/:id
recipesRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('recipes').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  await ref.delete()
  await db.collection('users').doc(req.userId!).update({
    recipesCount: FieldValue.increment(-1),
  })
  res.json({ success: true })
})

// PATCH /api/recipes/:id/done — toggle done
recipesRouter.patch('/:id/done', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('recipes').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  const current = doc.data()?.isDone ?? false
  await ref.update({ isDone: !current, updatedAt: FieldValue.serverTimestamp() })
  res.json({ isDone: !current })
})
