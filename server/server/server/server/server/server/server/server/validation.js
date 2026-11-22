export const genres = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other']
const fields = ['title', 'author', 'year', 'genre', 'read', 'rating']

export function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

export function positiveInteger(value, name) {
  const number = Number(value)
  if (typeof value !== 'string' || !/^\d+$/.test(value) || !Number.isSafeInteger(number) || number < 1) {
    fail(400, `${name} must be a positive integer`)
  }
  return number
}

export function bookFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'Send a JSON object as the request body')
  }
  const result = {}
  for (const field of fields) {
    if (Object.hasOwn(body, field)) result[field] = body[field]
  }
  return result
}

export function validateBook({ title, author, year, genre, read = false, rating = null }) {
  for (const [field, text] of Object.entries({ title, author })) {
    if (typeof text !== 'string' || text.trim().length < 1 || text.trim().length > 100) {
      fail(400, `${field} must be a string of 1 to 100 characters after trimming`)
    }
  }
  const currentYear = new Date().getFullYear()
  if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
    fail(400, `year must be an integer from 1000 to ${currentYear}`)
  }
  if (!genres.includes(genre)) fail(400, `genre must be one of: ${genres.join(', ')}`)
  if (typeof read !== 'boolean') fail(400, 'read must be a boolean')
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    fail(400, 'rating must be an integer from 1 to 5 or null')
  }
  if (rating !== null && !read) fail(400, 'Set read to true before assigning a rating')
  return { title: title.trim(), author: author.trim(), year, genre, read, rating }
}