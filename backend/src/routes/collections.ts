import { Router } from 'express'
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth'
import { db } from '../lib/firebase'
import { FieldValue } from 'firebase-admin/firestore'
import { randomBytes } from 'crypto'

export const collectionsRouter = Router()

function generateSlug(): string {
  return randomBytes(6).toString('base64url').slice(0, 10)
}

// GET /api/collections/public/:slug — public access, no auth needed
collectionsRouter.get('/public/:slug', optionalAuth, async (req, res) => {
  const snap = await db.collection('collections').where('shareSlug', '==', req.params.slug).where('isPublic', '==', true).limit(1).get()
  if (snap.empty) return res.status(404).json({ error: 'Coleção não encontrada' })
  const col = { id: snap.docs[0].id, ...snap.docs[0].data() }
  res.json(col)
})

// POST /api/collections
collectionsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId!).get()
    const userData = userDoc.data() || {}
    const plan = userData.plan || 'free'

    if (plan === 'free' && req.body.isPublic === false) {
      return res.status(402).json({ error: 'O plano gratuito não permite coleções privadas. Faz upgrade para Pro.', code: 'PRIVATE_COLLECTIONS' })
    }

    if (plan === 'free') {
      const existingSnap = await db.collection('collections').where('userId', '==', req.userId).get()
      if (existingSnap.size >= 2) {
        return res.status(402).json({ error: 'Atingiste o limite de 2 coleções no plano gratuito. Faz upgrade para Pro.', code: 'COLLECTIONS_LIMIT' })
      }
    }

    const ref = await db.collection('collections').add({
      ...req.body,
      userId: req.userId,
      recipeIds: [],
      shareSlug: generateSlug(),
      createdAt: FieldValue.serverTimestamp(),
    })
    res.json({ id: ref.id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/collections — user's collections
collectionsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const snap = await db.collection('collections').where('userId', '==', req.userId).orderBy('createdAt', 'desc').get()
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
})

// GET /api/collections/:id
collectionsRouter.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const doc = await db.collection('collections').doc(req.params.id).get()
  if (!doc.exists) return res.status(404).json({ error: 'Não encontrada' })
  const data = doc.data()!
  if (data.userId !== req.userId && !data.isPublic) return res.status(403).json({ error: 'Acesso negado' })
  res.json({ id: doc.id, ...data })
})

// PUT /api/collections/:id
collectionsRouter.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('collections').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })

  const userDoc = await db.collection('users').doc(req.userId!).get()
  const plan = userDoc.data()?.plan || 'free'
  if (plan === 'free' && req.body.isPublic === false) {
    return res.status(402).json({ error: 'O plano gratuito não permite coleções privadas.', code: 'PRIVATE_COLLECTIONS' })
  }

  await ref.update(req.body)
  res.json({ success: true })
})

// DELETE /api/collections/:id
collectionsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('collections').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  await ref.delete()
  res.json({ success: true })
})

// POST /api/collections/:id/recipes — add recipe
collectionsRouter.post('/:id/recipes', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('collections').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  await ref.update({ recipeIds: FieldValue.arrayUnion(req.body.recipeId) })
  res.json({ success: true })
})

// DELETE /api/collections/:id/recipes/:rid — remove recipe
collectionsRouter.delete('/:id/recipes/:rid', requireAuth, async (req: AuthRequest, res) => {
  const ref = db.collection('collections').doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists || doc.data()?.userId !== req.userId) return res.status(403).json({ error: 'Acesso negado' })
  await ref.update({ recipeIds: FieldValue.arrayRemove(req.params.rid) })
  res.json({ success: true })
})
