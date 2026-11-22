import { Router } from 'express'
import * as store from './booksStore.js'
import { filterBooks } from './bookQuery.js'
import { positiveInteger } from './validation.js'

export const booksRoutes = Router()

booksRoutes.get('/', async (req, res) => {
  res.json(filterBooks(await store.listBooks(), req.query))
})

booksRoutes.get('/:id', async (req, res) => {
  res.json(await store.getBook(positiveInteger(req.params.id, 'id')))
})

booksRoutes.post('/', async (req, res) => {
  const book = await store.createBook(req.body)
  res.location(`/api/books/${book.id}`).status(201).json(book)
})

booksRoutes.put('/:id', async (req, res) => {
  const book = await store.updateBook(positiveInteger(req.params.id, 'id'), req.body, false)
  res.json(book)
})

booksRoutes.patch('/:id', async (req, res) => {
  const book = await store.updateBook(positiveInteger(req.params.id, 'id'), req.body, true)
  res.json(book)
})

booksRoutes.delete('/:id', async (req, res) => {
  await store.deleteBook(positiveInteger(req.params.id, 'id'))
  res.status(204).end()
})