import { seedBooks } from './seedBooks.js'
import { bookFields, fail, validateBook } from './validation.js'

let books = seedBooks
let nextId = Math.max(...books.map(book => book.id)) + 1

function delay() {
  return new Promise(resolve => setTimeout(resolve, 20))
}

function findBook(id) {
  const book = books.find(item => item.id === id)
  if (!book) fail(404, `Book ${id} was not found`)
  return book
}

function rejectDuplicate(book, id) {
  if (books.some(item => item.id !== id &&
    item.title.toLowerCase() === book.title.toLowerCase() &&
    item.author.toLowerCase() === book.author.toLowerCase())) {
    fail(409, 'A book with this title and author already exists')
  }
}

export async function listBooks() {
  await delay()
  return [...books]
}

export async function getBook(id) {
  await delay()
  return findBook(id)
}

export async function createBook(body) {
  await delay()
  const fields = validateBook(bookFields(body))
  rejectDuplicate(fields)
  const book = { id: nextId, ...fields }
  nextId += 1
  books = [...books, book]
  return book
}

export async function updateBook(id, body, partial) {
  await delay()
  const existing = findBook(id)
  const changes = bookFields(body)
  const book = { id, ...validateBook(partial ? { ...existing, ...changes } : changes) }
  rejectDuplicate(book, id)
  books = books.map(item => item.id === id ? book : item)
  return book
}

export async function deleteBook(id) {
  await delay()
  findBook(id)
  books = books.filter(book => book.id !== id)
}