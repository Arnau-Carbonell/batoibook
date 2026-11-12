// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import Controller from '../src/controller/controller.class.js'
import { server, resetDB, getDB } from './mocks/server.js'
import { html, modulesData, booksData, usersData, fillBookForm } from './fixtures/dom.js'

const newBookData = () => ({ id: '', moduleCode: '0485', publisher: 'SM', price: 20, pages: 100, status: 'new', photo: '', comments: '', soldDate: '' })

let controller

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  vi.restoreAllMocks()
})
afterAll(() => server.close())

beforeEach(() => {
  window.location.hash = ''
  resetDB({ books: booksData, users: usersData, modules: modulesData })
  document.body.innerHTML = html
  controller = new Controller()
})

const cardIds = () => [...document.querySelectorAll('#list .card')].map(card => card.dataset.id)
const alerts = type => document.querySelectorAll(`#messages .alert-${type}`)
const clickCardButton = (bookId, action) =>
  document.querySelector(`#list .card[data-id="${bookId}"] button[data-action="${action}"]`).click()

describe('init', () => {
  test('carga los datos en el modelo, incluido el carrito', async () => {
    const cartPopulate = vi.spyOn(controller.model.cart, 'populate')
    await controller.init()
    expect(controller.model.books.data).toHaveLength(booksData.length)
    expect(controller.model.users.data).toHaveLength(usersData.length)
    expect(controller.model.modules.data).toHaveLength(modulesData.length)
    expect(cartPopulate).toHaveBeenCalledTimes(1)
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

  test('inicia el router mostrando la lista de libros', async () => {
    await controller.init()
    expect(document.getElementById('list').classList.contains('hidden')).toBe(false)
    expect(document.getElementById('form').classList.contains('hidden')).toBe(true)
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

describe('handleSubmitBook: añadir', () => {
  beforeEach(async () => {
    await controller.init()
  })

  test('guarda el libro como del usuario 2 en el servidor y en el modelo', async () => {
    await controller.handleSubmitBook(newBookData())
    expect(getDB().books).toHaveLength(booksData.length + 1)
    expect(getDB().books[2].userId).toBe(2)
    expect(getDB().books[2]).not.toHaveProperty('id', '')
    expect(controller.model.books.data).toHaveLength(booksData.length + 1)
  })

  test('pinta el libro, restablece el formulario y muestra un mensaje informativo', async () => {
    const resetForm = vi.spyOn(controller.view, 'resetForm')
    fillBookForm(controller.view.bookForm)

    await controller.handleSubmitBook(newBookData())

    expect(cardIds()).toEqual(['1', '2', '3'])
    expect(resetForm).toHaveBeenCalledTimes(1)
    expect(controller.view.bookForm.elements.publisher.value).toBe('')
    expect(alerts('info')[0].textContent).toContain('Libro añadido')
  })

  test('se ejecuta al enviar el formulario', async () => {
    const addBook = vi.spyOn(controller.model.books, 'addBook')
    fillBookForm(controller.view.bookForm)

    controller.view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
    await vi.waitFor(() => expect(cardIds()).toHaveLength(3))

    expect(addBook).toHaveBeenCalledTimes(1)
    expect(addBook).toHaveBeenCalledWith(expect.objectContaining({ userId: 2, moduleCode: '0485', price: 19.5 }))
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

  test('si ya tenemos un libro de ese módulo muestra un error', async () => {
    await controller.handleSubmitBook(newBookData())
    await controller.handleSubmitBook(newBookData())
    expect(alerts('error')).toHaveLength(1)
    expect(getDB().books).toHaveLength(booksData.length + 1)
  })
})

describe('Editar libro', () => {
  beforeEach(async () => {
    await controller.init()
  })

  test('al pulsar editar se rellena el formulario y se muestra', async () => {
    const renderEditForm = vi.spyOn(controller.view, 'renderEditForm')

    clickCardButton(2, 'edit')
    await vi.waitFor(() => expect(document.getElementById('form').classList.contains('hidden')).toBe(false))

    expect(renderEditForm).toHaveBeenCalledWith(controller.model.books.data[1])
    expect(controller.view.formTitle.textContent).toBe('Editar libro')
    expect(controller.view.idInput.value).toBe('2')
    expect(document.getElementById('list').classList.contains('hidden')).toBe(true)
  })

  test('al enviar en modo edición modifica el libro en el servidor, el modelo y la vista', async () => {
    controller.handleEditBook('1')
    controller.view.bookForm.elements.price.value = '7'

    await controller.handleSubmitBook(controller.view.getBookFormValues())

    expect(getDB().books).toHaveLength(booksData.length)
    expect(getDB().books[0]).toMatchObject({ id: 1, userId: 7, price: 7, publisher: 'Apunts' })
    expect(controller.model.books.getBookById(1).price).toBe(7)
    expect(cardIds()).toEqual(['1', '2'])
    expect(document.querySelector('#list .card[data-id="1"]').textContent).toContain('7 €')
    expect(alerts('info')[0].textContent).toContain('Libro modificado')
  })

  test('tras modificar, el formulario queda vacío y preparado para añadir', async () => {
    controller.handleEditBook('1')
    await controller.handleSubmitBook(controller.view.getBookFormValues())

    expect(controller.view.formTitle.textContent).toBe('Añadir libro')
    expect(controller.view.idDiv.classList.contains('hidden')).toBe(true)
    expect(controller.view.bookForm.elements.publisher.value).toBe('')
  })

  test('si el servidor falla al modificar muestra el error y no cambia nada', async () => {
    server.use(http.put('http://localhost:3000/books/:id', () => new HttpResponse(null, { status: 500 })))
    controller.handleEditBook('1')
    controller.view.bookForm.elements.price.value = '7'

    await controller.handleSubmitBook(controller.view.getBookFormValues())

    expect(alerts('error')).toHaveLength(1)
    expect(alerts('info')).toHaveLength(0)
    expect(controller.model.books.getBookById(1).price).toBe(12)
    expect(controller.view.formTitle.textContent).toBe('Editar libro')
  })
})

describe('Carrito', () => {
  beforeEach(async () => {
    await controller.init()
  })

  test('al pulsar el carrito añade una copia del libro y lo informa', () => {
    clickCardButton(1, 'cart')

    expect(controller.model.cart.data).toHaveLength(1)
    expect(controller.model.cart.getBookById(1)).toEqual(controller.model.books.getBookById(1))
    expect(controller.model.cart.getBookById(1)).not.toBe(controller.model.books.getBookById(1))
    expect(alerts('info')[0].textContent).toContain('añadido al carrito')
  })

  test('si el libro ya está en el carrito muestra un error', () => {
    clickCardButton(1, 'cart')
    clickCardButton(1, 'cart')

    expect(controller.model.cart.data).toHaveLength(1)
    expect(alerts('info')).toHaveLength(1)
    expect(alerts('error')).toHaveLength(1)
  })
})

describe('handleRemoveBook', () => {
  beforeEach(async () => {
    await controller.init()
  })

  test('borra el libro del servidor, del modelo y de la vista', async () => {
    await controller.handleRemoveBook('1')

    expect(getDB().books.some(book => book.id === 1)).toBe(false)
    expect(controller.model.books.data.some(book => book.id === 1)).toBe(false)
    expect(cardIds()).toEqual(['2'])
    expect(alerts('info')[0].textContent).toContain('eliminado')
  })

  test('al pulsar borrar y confirmar se elimina el libro', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    clickCardButton(2, 'delete')
    await vi.waitFor(() => expect(cardIds()).toEqual(['1']))
  })

  test('al pulsar borrar y cancelar no se elimina nada', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const removeBook = vi.spyOn(controller.model.books, 'removeBook')

    clickCardButton(2, 'delete')

    expect(removeBook).not.toHaveBeenCalled()
    expect(cardIds()).toEqual(['1', '2'])
  })

  test('si el libro estaba en el carrito también se quita de él', async () => {
    controller.handleAddToCart('1')
    await controller.handleRemoveBook('1')
    expect(controller.model.cart.data).toHaveLength(0)
  })

  test('si el libro no existe muestra un error y no confirma', async () => {
    const showMessage = vi.spyOn(controller.view, 'showMessage')

    await controller.handleRemoveBook('500')

    expect(showMessage).toHaveBeenCalledTimes(1)
    expect(showMessage).toHaveBeenCalledWith('error', expect.stringContaining('500'))
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
