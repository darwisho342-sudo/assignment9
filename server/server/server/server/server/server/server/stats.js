export function calculateStats(books) {
  const read = books.filter(book => book.read).length
  const ratedBooks = books.filter(book => book.rating !== null)
  const sum = ratedBooks.reduce((total, book) => total + book.rating, 0)
  const byGenre = {}
  for (const book of books) {
    byGenre[book.genre] = (byGenre[book.genre] ?? 0) + 1
  }
  return {
    total: books.length,
    read,
    unread: books.length - read,
    averageRating: ratedBooks.length ? sum / ratedBooks.length : null,
    byGenre,
  }
}