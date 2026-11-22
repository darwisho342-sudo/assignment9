import { useEffect, useState } from 'react'
import { addBook, changeBook, getStats, listBooks, removeBook, replaceBook } from './api/books.js'
import BookForm from './BookForm.jsx'
import BookList from './BookList.jsx'
import Filters from './Filters.jsx'
import Stats from './Stats.jsx'

export default function App() {
  const [filters, setFilters] = useState({ q: '', genre: '', read: '', sort: '', order: 'asc', page: 1 })
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState(null)
  const [listError, setListError] = useState('')
  const [statsError, setStatsError] = useState('')
  const [changeError, setChangeError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    setLoading(true)
    setListError('')
    listBooks(filters, signal)
      .then(result => {
        if (!signal.aborted) setBooks(result)
      })
      .catch(error => {
        if (!signal.aborted && error.name !== 'AbortError') setListError(error.message)
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [filters, version])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    setStatsError('')
    getStats(signal)
      .then(result => {
        if (!signal.aborted) setStats(result)
      })
      .catch(error => {
        if (!signal.aborted && error.name !== 'AbortError') setStatsError(error.message)
      })
    return () => controller.abort()
  }, [version])

  async function mutate(operation, closeForm = false) {
    setSaving(true)
    setChangeError('')
    try {
      await operation()
      if (closeForm) setEditing(null)
      setVersion(previous => previous + 1)
      return true
    } catch (error) {
      setChangeError(error.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  function changeFilter(key, value) {
    setFilters(previous => ({ ...previous, page: 1, [key]: value }))
  }

  return (
    <main>
      <h1>Reading List</h1>
      <div className="layout">
        <div>
          <BookForm
            key={editing?.id ?? 'add'}
            book={editing}
            saving={saving}
            onSave={body => editing ? mutate(() => replaceBook(editing.id, body), true) : mutate(() => addBook(body))}
            onCancel={() => setEditing(null)}
          />
          {changeError && <p role="alert">{changeError}</p>}
          <section>
            <h2>Books</h2>
            <Filters filters={filters} onChange={changeFilter} />
            {loading && <p role="status">Loading books…</p>}
            {listError && <p role="alert">{listError}</p>}
            {!loading && !listError && books.length === 0 && <p>No books found.</p>}
            {!loading && !listError && (
              <BookList books={books} busy={saving || Boolean(editing)} onEdit={setEditing}
                onChange={(id, body) => mutate(() => changeBook(id, body))}
                onDelete={id => mutate(() => removeBook(id))}
              />
            )}
            {(filters.page > 1 || books.length === 50) && (
              <nav aria-label="Book pages" className="actions">
                <button disabled={loading || filters.page === 1} onClick={() => changeFilter('page', filters.page - 1)}>Previous</button>
                <span>Page {filters.page}</span>
                <button disabled={loading || books.length < 50} onClick={() => changeFilter('page', filters.page + 1)}>Next</button>
              </nav>
            )}
          </section>
        </div>
        <Stats data={stats} error={statsError} />
      </div>
    </main>
  )
}