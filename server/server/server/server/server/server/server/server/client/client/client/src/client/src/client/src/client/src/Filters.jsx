export const genres = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other']

export default function Filters({ filters, onChange }) {
  return (
    <section aria-label="Book filters" className="controls">
      <label>Search
        <input type="search" value={filters.q} onChange={event => onChange('q', event.target.value)} />
      </label>
      <label>Genre
        <select value={filters.genre} onChange={event => onChange('genre', event.target.value)}>
          <option value="">All genres</option>
          {genres.map(genre => <option key={genre}>{genre}</option>)}
        </select>
      </label>
      <label>Read status
        <select value={filters.read} onChange={event => onChange('read', event.target.value)}>
          <option value="">Any status</option>
          <option value="true">Read</option>
          <option value="false">Unread</option>
        </select>
      </label>
      <label>Sort by
        <select value={filters.sort} onChange={event => onChange('sort', event.target.value)}>
          <option value="">ID</option>
          {['title', 'author', 'year', 'rating'].map(field => <option key={field}>{field}</option>)}
        </select>
      </label>
      <label>Direction
        <select value={filters.order} onChange={event => onChange('order', event.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
    </section>
  )
}