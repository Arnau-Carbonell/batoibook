// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import Controller from '../src/controller/controller.class.js'
import { server, resetDB, getDB } from './mocks/server.js'
import { html, modulesData, booksData, usersData, fillBookForm } from './fixtures/dom.js'

const newBookData = () => ({ userId: 9, moduleCode: '0485', publisher: 'SM', price: 20, pages: 100, status: 'new', photo: '', comments: '', soldDate: '' })

let controller

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  vi.restoreAllMocks()
})
afterAll(() => server.close())

beforeEach(() => {
  resetDB({ books: booksData, users: usersData, modules: modulesData })
  document.body.innerHTML = html
  controller = new Controller()
})

const cardIds = () => [...document.querySelectorAll('#list .card')].map(card => card.dataset.id)
const alerts = type => document.querySelectorAll(`#messages .alert-${type}`)

describe('init', () => {
  test('carga los datos en el modelo', async () => {
    await controller.init()
    expect(controller.model.books.data).toHaveLength(booksData.length)
    expect(controller.model.users.data).toHaveLength(usersData.length)
    expect(controller.model.modules.data).toHaveLength(modulesData.length)
  })

  test('solicita a la vista que muestre los módulos y los libros', async () => {
    const renderModules = vi.spyOn(controller.view, 'renderModulesSelect')
    const renderBooks = vi.spyOn(controller.view, 'renderBooksList')

    await controller.init()

    expect(renderModules).toHaveBeenCalledWith(controller.model.modules.data)
    expect(renderBooks).toHaveBeenCalledWith(controller.model.books.data, controller.model.modules.data)
    expect(cardIds()).toEqual(['1', '2'])
    expect(document.querySelectorAll('#moduleCode option')).toHaveLength(modulesData.length + 1)
  })

  test('si falla la carga muestra un error a la vista', async () => {
    server.use(http.get('http://localhost:3000/books', () => new HttpResponse(null, { status: 500 })))
    const showMessage = vi.spyOn(controller.view, 'showMessage')

    await controller.init()

    expect(showMessage).toHaveBeenCalledWith('error', expect.any(String))
    expect(alerts('error')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
  })
})

describe('handleSubmitBook', () => {
  beforeEach(async () => {
    await controller.init()
  })

  test('guarda el libro en el servidor y en el modelo', async () => {
    await controller.handleSubmitBook(newBookData())
    expect(getDB().books).toHaveLength(booksData.length + 1)
    expect(controller.model.books.data).toHaveLength(booksData.length + 1)
  })

  test('actualiza la vista, restablece el formulario y muestra un mensaje informativo', async () => {
    const resetForm = vi.spyOn(controller.view, 'resetForm')
    fillBookForm(controller.view.bookForm)

    await controller.handleSubmitBook(newBookData())

    expect(cardIds()).toEqual(['1', '2', '3'])
    expect(resetForm).toHaveBeenCalledTimes(1)
    expect(controller.view.bookForm.elements.publisher.value).toBe('')
    expect(alerts('info')).toHaveLength(1)
    expect(alerts('info')[0].textContent).toContain('Libro añadido')
  })

  test('se ejecuta al enviar el formulario', async () => {
    const addBook = vi.spyOn(controller.model.books, 'addBook')
    fillBookForm(controller.view.bookForm)

    controller.view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
    await vi.waitFor(() => expect(cardIds()).toHaveLength(3))

    expect(addBook).toHaveBeenCalledTimes(1)
    expect(addBook).toHaveBeenCalledWith(expect.objectContaining({ userId: 9, moduleCode: '0485', price: 19.5 }))
  })

  test('si el servidor falla muestra el error, no añade nada y no confirma', async () => {
    server.use(http.post('http://localhost:3000/books', () => new HttpResponse(null, { status: 500 })))
    const resetForm = vi.spyOn(controller.view, 'resetForm')

    await controller.handleSubmitBook(newBookData())

    expect(alerts('error')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
    expect(cardIds()).toEqual(['1', '2'])
    expect(resetForm).not.toHaveBeenCalled()
  })

  test('si el usuario ya tiene un libro de ese módulo muestra un error', async () => {
    await controller.handleSubmitBook({ ...newBookData(), userId: 7, moduleCode: '0373' })
    expect(alerts('error')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
    expect(getDB().books).toHaveLength(booksData.length)
  })
})

describe('handleRemoveBook', () => {
  beforeEach(async () => {
    await controller.init()
  })

  test('borra el libro del servidor y actualiza el listado', async () => {
    await controller.handleRemoveBook('1')

    expect(getDB().books.some(book => book.id === 1)).toBe(false)
    expect(controller.model.books.data.some(book => book.id === 1)).toBe(false)
    expect(cardIds()).toEqual(['2'])
    expect(alerts('info')[0].textContent).toContain('Libro eliminado')
  })

  test('se ejecuta al pulsar el botón de borrar', async () => {
    document.getElementById('id-remove').value = '2'
    document.getElementById('remove-button').click()

    await vi.waitFor(() => expect(cardIds()).toEqual(['1']))
  })

  test('si el libro no existe muestra un error y no confirma', async () => {
    const showMessage = vi.spyOn(controller.view, 'showMessage')

    await controller.handleRemoveBook('500')

    expect(showMessage).toHaveBeenCalledTimes(1)
    expect(showMessage).toHaveBeenCalledWith('error', expect.stringContaining('500'))
    expect(alerts('info')).toHaveLength(0)
    expect(cardIds()).toEqual(['1', '2'])
  })

  test('si el servidor falla muestra el error y no cambia el listado', async () => {
    server.use(http.delete('http://localhost:3000/books/:id', () => new HttpResponse(null, { status: 500 })))

    await controller.handleRemoveBook('1')

    expect(alerts('error')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
    expect(cardIds()).toEqual(['1', '2'])
  })
})
