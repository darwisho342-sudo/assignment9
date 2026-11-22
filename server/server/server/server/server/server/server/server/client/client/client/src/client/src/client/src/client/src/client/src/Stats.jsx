export default function Stats({ data, error }) {
  return (
    <aside>
      <h2>Statistics</h2>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p>Loading statistics…</p>}
      {data && (
        <>
          <p>{data.total} total · {data.read} read · {data.unread} unread</p>
          <p>Average rating {data.averageRating === null ? '—' : `${data.averageRating.toFixed(2)} / 5`}</p>
          <ul>{Object.entries(data.byGenre).map(([genre, count]) => <li key={genre}>{genre} ({count})</li>)}</ul>
        </>
      )}
    </aside>
  )
}