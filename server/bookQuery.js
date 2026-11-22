import { fail, genres, positiveInteger } from './validation.js'

export function filterBooks(books, query) {
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'string') fail(400, `Send ${key} only once`)
  }

  const { genre, read, q = '', sort, order = 'asc' } = query
  if (genre !== undefined && !genres.includes(genre)) fail(400, 'Invalid genre filter')
  if (read !== undefined && !['true', 'false'].includes(read)) fail(400, 'read must be true or false')
  if (sort !== undefined && !['title', 'author', 'year', 'rating'].includes(sort)) {
    fail(400, 'sort must be title, author, year or rating')
  }
  if (!['asc', 'desc'].includes(order)) fail(400, 'order must be asc or desc')
  const limit = positiveInteger(query.limit ?? '50', 'limit')
  const page = positiveInteger(query.page ?? '1', 'page')
  if (limit > 50) fail(400, 'limit must be between 1 and 50')

  const term = q.toLowerCase()
  const filtered = books.filter(book =>
    (genre === undefined || book.genre === genre) &&
    (read === undefined || book.read === (read === 'true')) &&
    (book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term))
  )
  const field = sort ?? 'id'
  const direction = order === 'asc' ? 1 : -1
  const sorted = [...filtered].sort((a, b) => {
    const left = a[field]
    const right = b[field]
    if (left === right) return a.id - b.id
    if (left === null) return 1
    if (right === null) return -1
    const comparison = typeof left === 'string' ? left.localeCompare(right) : left - right
    return comparison * direction
  })
  const start = (page - 1) * limit
  return sorted.slice(start, start + limit)
}