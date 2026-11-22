const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

async function request(path, { method = 'GET', body, signal } = {}) {
  const options = { method, signal }
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }
  const response = await fetch(`${baseUrl}${path}`, options)
  if (response.status === 204) return
  const data = await response.json().catch(error => {
    if (error.name === 'AbortError') throw error
    if (response.ok) throw new Error('The API returned an invalid response')
    return null
  })
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`)
  return data
}

export function listBooks(filters, signal) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') query.set(key, value)
  }
  return request(`/books?${query}`, { signal })
}

export const getStats = signal => request('/stats', { signal })
export const addBook = body => request('/books', { method: 'POST', body })
export const replaceBook = (id, body) => request(`/books/${id}`, { method: 'PUT', body })
export const changeBook = (id, body) => request(`/books/${id}`, { method: 'PATCH', body })
export const removeBook = id => request(`/books/${id}`, { method: 'DELETE' })