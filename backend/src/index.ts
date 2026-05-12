import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { recipesRouter } from './routes/recipes'
import { collectionsRouter } from './routes/collections'
import { feedRouter } from './routes/feed'
import { usersRouter } from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

app.use('/api/recipes', recipesRouter)
app.use('/api/collections', collectionsRouter)
app.use('/api/feed', feedRouter)
app.use('/api/users', usersRouter)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`RecipeVault backend running on port ${PORT}`))
