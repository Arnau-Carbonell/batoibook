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

  test('con datos incorrectos no se hace ninguna petición al servidor', async () => {
    const requests = []
    server.events.on('request:start', ({ request }) => requests.push(request))
    fillBookForm(controller.view.bookForm)
    controller.view.bookForm.elements.price.value = '-5'

    controller.view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 20))

    server.events.removeAllListeners()
    expect(requests).toHaveLength(0)
    expect(document.getElementById('price-error').textContent).not.toBe('')
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

describe('Un libro de cada módulo', () => {
  const moduleError = () => document.getElementById('moduleCode-error').textContent
  const chooseModule = code => {
    const select = controller.view.moduleSelect
    select.value = code
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }
  const ourBook = { id: 3, userId: 2, moduleCode: '0373', publisher: 'SM', price: 10, pages: 50, status: 'good', comments: '', soldDate: '' }

  beforeEach(async () => {
    resetDB({ books: [...booksData, ourBook], users: usersData, modules: modulesData })
    await controller.init()
  })

  test('al elegir un módulo del que ya tenemos libro se muestra su error y no se puede enviar', async () => {
    const addBook = vi.spyOn(controller.model.books, 'addBook')
    fillBookForm(controller.view.bookForm)
    chooseModule('0373')
    await vi.waitFor(() => expect(moduleError()).toMatch(/módulo/i))

    expect(document.getElementById('publisher-error').textContent).toBe('')
    controller.view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(addBook).not.toHaveBeenCalled()
  })

  test('sólo se muestra el error del módulo, no el del resto de campos', async () => {
    chooseModule('0373')
    await vi.waitFor(() => expect(moduleError()).not.toBe(''))
    ;['publisher', 'price', 'pages', 'status'].forEach(name =>
      expect(document.getElementById(`${name}-error`).textContent).toBe(''))
  })

  test('se pregunta al servidor, no a la copia local', async () => {
    getDB().books.push({ ...ourBook, id: 4, moduleCode: '0485' })
    chooseModule('0485')
    await vi.waitFor(() => expect(moduleError()).not.toBe(''))
  })

  test('al cambiar a un módulo sin libros el error desaparece y se puede guardar', async () => {
    fillBookForm(controller.view.bookForm)
    chooseModule('0373')
    await vi.waitFor(() => expect(moduleError()).not.toBe(''))
    chooseModule('0485')
    await vi.waitFor(() => expect(moduleError()).toBe(''))

    controller.view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
    await vi.waitFor(() => expect(cardIds()).toHaveLength(4))
  })

  test('si el usuario envía antes de recibir la respuesta tampoco se guarda', async () => {
    fillBookForm(controller.view.bookForm)
    chooseModule('0373')
    controller.view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))

    await vi.waitFor(() => expect(moduleError()).not.toBe(''))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(getDB().books).toHaveLength(booksData.length + 1)
  })

  test('si no se puede comprobar se avisa y el módulo no se marca como repetido', async () => {
    server.use(http.get('http://localhost:3000/books', () => new HttpResponse(null, { status: 500 })))
    chooseModule('0373')
    await vi.waitFor(() => expect(alerts('error')).toHaveLength(1))
    expect(moduleError()).toBe('')
    expect(controller.view.moduleSelect.validity.valid).toBe(true)
  })

  test('Reset quita el error del módulo', async () => {
    chooseModule('0373')
    await vi.waitFor(() => expect(moduleError()).not.toBe(''))
    controller.view.bookForm.querySelector('button[type="reset"]').click()
    expect(moduleError()).toBe('')
    expect(controller.view.moduleSelect.validity.valid).toBe(false) // sólo porque está vacío
    expect(controller.view.moduleSelect.validity.customError).toBe(false)
  })

  test('al editar, dejar el módulo del propio libro no es repetido', async () => {
    controller.handleEditBook('3')
    chooseModule('0373')
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(moduleError()).toBe('')

    await controller.handleSubmitBook(controller.view.getBookFormValues())
    expect(alerts('info')[0].textContent).toContain('Libro modificado')
  })

  test('al editar, cambiar a un módulo del que el dueño ya tiene otro libro es repetido', async () => {
    // El libro 1 es del usuario 7, que no tiene más libros; le damos uno del 0485
    getDB().books.push({ ...ourBook, id: 9, userId: 7, moduleCode: '0485' })
    controller.handleEditBook('1')
    chooseModule('0485')
    await vi.waitFor(() => expect(moduleError()).not.toBe(''))
  })
})
