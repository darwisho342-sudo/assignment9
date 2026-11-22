export default function BookList({ books, busy, onEdit, onChange, onDelete }) {
  return (
    <ul className="books">
      {books.map(book => (
        <li key={book.id}>
          <div>
            <strong>{book.title}</strong>
            <div>{book.author} · {book.year} · {book.genre} · {book.read ? 'Read' : 'Unread'}</div>
          </div>
          <div className="actions">
            <button disabled={busy} onClick={() => onChange(book.id, book.read ? { read: false, rating: null } : { read: true })}>
              {book.read ? 'Mark unread' : 'Mark read'}
            </button>
            <label>Rating
              <select aria-label={`Rating for ${book.title}`} disabled={busy || !book.read} value={book.rating ?? ''} onChange={event => onChange(book.id, { rating: event.target.value ? Number(event.target.value) : null })}>
                <option value="">Unrated</option>
                {[1, 2, 3, 4, 5].map(rating => <option key={rating}>{rating}</option>)}
              </select>
            </label>
            <button disabled={busy} onClick={() => onEdit(book)}>Edit</button>
            <button disabled={busy} onClick={() => onDelete(book.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}