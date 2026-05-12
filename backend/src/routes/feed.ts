import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { db } from '../lib/firebase'
import { FieldValue } from 'firebase-admin/firestore'

export const feedRouter = Router()
export const usersRouter = Router()

// GET /api/feed — public recipes
feedRouter.get('/', async (req, res) => {
  const { category, limit = '20' } = req.query
  let query = db.collection('recipes').where('isPublic', '==', true)
  if (category) query = query.where('category', '==', category)
  const snap = await query.orderBy('createdAt', 'desc').limit(Number(limit)).get()
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
})

// GET /api/users/:id/profile
usersRouter.get('/:id/profile', async (req, res) => {
  const doc = await db.collection('users').doc(req.params.id).get()
  if (!doc.exists) return res.status(404).json({ error: 'Utilizador não encontrado' })
  const { email, ...publicData } = doc.data() as any
  const recipesSnap = await db.collection('recipes').where('userId', '==', req.params.id).where('isPublic', '==', true).get()
  const collectionsSnap = await db.collection('collections').where('userId', '==', req.params.id).where('isPublic', '==', true).get()
  res.json({
    id: doc.id,
    ...publicData,
    recipes: recipesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    collections: collectionsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  })
})

// POST /api/users/:id/follow
usersRouter.post('/:id/follow', requireAuth, async (req: AuthRequest, res) => {
  if (req.params.id === req.userId) return res.status(400).json({ error: 'Não podes seguir-te a ti próprio' })
  await db.collection('users').doc(req.userId!).update({ following: FieldValue.arrayUnion(req.params.id) })
  res.json({ success: true })
})
