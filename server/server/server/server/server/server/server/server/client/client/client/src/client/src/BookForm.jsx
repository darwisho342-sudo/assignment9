import { useState } from 'react'
import { genres } from './Filters.jsx'

const emptyBook = { title: '', author: '', year: '', genre: 'fiction', read: false, rating: null }

export default function BookForm({ book, saving, onSave, onCancel }) {
  const [draft, setDraft] = useState(book || emptyBook)

  function update(field, value) {
    setDraft(previous => ({ ...previous, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    const saved = await onSave({ ...draft, year: Number(draft.year) })
    if (saved && !book) setDraft(emptyBook)
  }

  return (
    <form onSubmit={submit}>
      <h2>{book ? 'Edit book' : 'Add a book'}</h2>
      <fieldset disabled={saving} className="controls">
        <label>Title
          <input required maxLength="100" value={draft.title} onChange={event => update('title', event.target.value)} />
        </label>
        <label>Author
          <input required maxLength="100" value={draft.author} onChange={event => update('author', event.target.value)} />
        </label>
        <label>Year
          <input required type="number" min="1000" max={new Date().getFullYear()} value={draft.year} onChange={event => update('year', event.target.value)} />
        </label>
        <label>Genre
          <select value={draft.genre} onChange={event => update('genre', event.target.value)}>
            {genres.map(genre => <option key={genre}>{genre}</option>)}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={draft.read} onChange={event => {
            const read = event.target.checked
            setDraft(previous => ({ ...previous, read, rating: read ? previous.rating : null }))
          }} /> Read
        </label>
        <label>Rating
          <select disabled={!draft.read} value={draft.rating ?? ''} onChange={event => update('rating', event.target.value ? Number(event.target.value) : null)}>
            <option value="">Unrated</option>
            {[1, 2, 3, 4, 5].map(rating => <option key={rating}>{rating}</option>)}
          </select>
        </label>
        <button type="submit">{saving ? 'Saving…' : 'Save book'}</button>
        {book && <button type="button" onClick={onCancel}>Cancel</button>}
      </fieldset>
    </form>
  )
}