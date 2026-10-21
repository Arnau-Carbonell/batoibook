// Simula la API de json-server en memoria usando msw. Cada test llama a
// resetDB() con sus datos para empezar siempre desde el mismo estado.
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const SERVER = 'http://localhost:3000'

let db = {}

export function resetDB(data = {}) {
  db = {
    books: structuredClone(data.books ?? []),
    users: structuredClone(data.users ?? []),
    modules: structuredClone(data.modules ?? []),
  }
}

export function getDB() {
  return db
}

const findIndex = (table, id) => db[table].findIndex(item => String(item.id) === id)

const notFound = () => new HttpResponse(null, { status: 404 })

function tableHandlers(table) {
  return [
    http.get(`${SERVER}/${table}`, () => HttpResponse.json(db[table])),

    http.get(`${SERVER}/${table}/:id`, ({ params }) => {
      const index = findIndex(table, params.id)
      return index === -1 ? notFound() : HttpResponse.json(db[table][index])
    }),

    http.post(`${SERVER}/${table}`, async ({ request }) => {
      const item = await request.json()
      const maxId = db[table].reduce((max, item) => Math.max(max, item.id), 0)
      const newItem = { ...item, id: maxId + 1 }
      db[table].push(newItem)
      return HttpResponse.json(newItem, { status: 201 })
    }),

    http.delete(`${SERVER}/${table}/:id`, ({ params }) => {
      const index = findIndex(table, params.id)
      if (index === -1) return notFound()
      const [deleted] = db[table].splice(index, 1)
      return HttpResponse.json(deleted)
    }),

    http.put(`${SERVER}/${table}/:id`, async ({ params, request }) => {
      const index = findIndex(table, params.id)
      if (index === -1) return notFound()
      db[table][index] = { ...(await request.json()), id: db[table][index].id }
      return HttpResponse.json(db[table][index])
    }),

    http.patch(`${SERVER}/${table}/:id`, async ({ params, request }) => {
      const index = findIndex(table, params.id)
      if (index === -1) return notFound()
      db[table][index] = { ...db[table][index], ...(await request.json()) }
      return HttpResponse.json(db[table][index])
    }),
  ]
}

export const server = setupServer(
  ...tableHandlers('books'),
  ...tableHandlers('users'),
  ...tableHandlers('modules'),
)
