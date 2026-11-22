import express from 'express'
import cors from 'cors'
import { booksRoutes } from './booksRoutes.js'
import { listBooks } from './booksStore.js'
import { calculateStats } from './stats.js'

const app = express()
const port = Number(process.env.PORT || 3000)
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin(origin, callback) {
    callback(null, origin === clientOrigin)
  },
}))
app.use(express.json())

app.use('/api/books', booksRoutes)
app.get('/api/stats', async (req, res) => {
  res.json(calculateStats(await listBooks()))
})
app.get('/api/crash', async () => {
  throw new Error('Deliberate async error')
})
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body contains malformed JSON' })
  }
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: error.message })
  }
  console.error(error)
  return res.status(500).json({ error: 'Something went wrong' })
})

app.listen(port, () => console.log(`Reading List API listening on http://localhost:${port}`))