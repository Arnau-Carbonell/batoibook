// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import View from '../src/view/view.class.js'
import Book from '../src/model/book.class.js'
import { html, modulesData, booksData, fillBookForm } from './fixtures/dom.js'

let view

beforeEach(() => {
  document.body.innerHTML = html
  view = new View()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Propiedades de la vista', () => {
  test('referencia los elementos de la página', () => {
    expect(view.booksList).toBe(document.getElementById('list'))
    expect(view.about).toBe(document.getElementById('about'))
    expect(view.form).toBe(document.getElementById('form'))
    expect(view.bookForm).toBe(document.getElementById('bookForm'))
    expect(view.moduleSelect).toBe(document.getElementById('moduleCode'))
    expect(view.messages).toBe(document.getElementById('messages'))
  })
})

describe('renderModulesSelect', () => {
  test('el desplegable muestra los módulos recibidos', () => {
    view.renderModulesSelect(modulesData)
    const options = [...view.moduleSelect.querySelectorAll('option')].filter(option => option.value !== '')
    expect(options).toHaveLength(modulesData.length)
    expect(options.map(option => option.value)).toEqual(['0373', '0485'])
    expect(options.map(option => option.textContent)).toEqual(['Desarrollo web en entorno cliente', 'Programación'])
  })

  test('mantiene la opción vacía inicial', () => {
    view.renderModulesSelect(modulesData)
    expect(view.moduleSelect.options[0].value).toBe('')
  })
})

describe('renderBook', () => {
  test('la tarjeta muestra los datos de un libro en venta', () => {
    const card = view.renderBook(new Book(booksData[0]), modulesData[0])
    expect(card.classList.contains('card')).toBe(true)
    expect(card.parentElement).toBe(view.booksList)

    const img = card.querySelector('.card-img img')
    expect(img.getAttribute('src')).toBe('foto1.png')
    expect(img.getAttribute('alt')).toBe('Libro: 1')

    const body = card.querySelector('.card-body')
    expect(body.querySelector('h3').textContent).toBe('Desarrollo web en entorno cliente (1)')
    const h4 = body.querySelectorAll('h4')
    expect(h4[0].textContent).toBe('Apunts')
    expect(h4[1].textContent).toBe('12 €')
    const p = [...body.querySelectorAll('p')].map(p => p.textContent)
    expect(p).toEqual(['40 páginas', 'Estado: good', 'En venta', 'Muy completos'])
  })

  test('la tarjeta de un libro vendido muestra la fecha de venta', () => {
    const card = view.renderBook(new Book(booksData[1]), modulesData[1])
    expect(card.querySelector('.card-body').textContent).toContain('Vendido el 21/12/2023')
    expect(card.querySelector('.card-body').textContent).not.toContain('En venta')
  })
})

describe('renderBooksList', () => {
  test('pinta una tarjeta por libro con el módulo correspondiente', () => {
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)
    const cards = view.booksList.querySelectorAll('.card')
    expect(cards).toHaveLength(2)
    expect(cards[1].querySelector('h3').textContent).toBe('Programación (2)')
  })

  test('al actualizar el listado no se duplican las tarjetas', () => {
    const books = booksData.map(book => new Book(book))
    view.renderBooksList(books, modulesData)
    view.renderBooksList(books, modulesData)
    expect(view.booksList.querySelectorAll('.card')).toHaveLength(2)

    view.renderBooksList(books.slice(1), modulesData)
    const cards = view.booksList.querySelectorAll('.card')
    expect(cards).toHaveLength(1)
    expect(cards[0].dataset.id).toBe('2')
  })
})

describe('showMessage', () => {
  test('muestra el mensaje con la estructura y clases indicadas', () => {
    view.showMessage('info', 'Libro añadido')
    const alert = view.messages.querySelector('.alert')
    expect(alert.className).toBe('info alert alert-info alert-dismissible')
    expect(alert.getAttribute('role')).toBe('alert')
    expect(alert.textContent).toContain('Libro añadido')
    expect(alert.querySelector('button.btn-close')).not.toBeNull()
  })

  test('el mensaje se cierra al pulsar el botón', () => {
    view.showMessage('error', 'Algo ha fallado')
    view.messages.querySelector('.btn-close').click()
    expect(view.messages.querySelector('.alert')).toBeNull()
  })

  test('los mensajes informativos desaparecen a los tres segundos', () => {
    vi.useFakeTimers()
    view.showMessage('info', 'Libro eliminado')
    vi.advanceTimersByTime(2999)
    expect(view.messages.querySelector('.alert-info')).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(view.messages.querySelector('.alert-info')).toBeNull()
  })

  test('los mensajes de error permanecen', () => {
    vi.useFakeTimers()
    view.showMessage('error', 'No existe el libro')
    vi.advanceTimersByTime(10000)
    expect(view.messages.querySelector('.alert-error').textContent).toContain('No existe el libro')
  })

  test('cerrar un mensaje antes de tiempo no da error al cumplirse los tres segundos', () => {
    vi.useFakeTimers()
    view.showMessage('info', 'Hola')
    view.messages.querySelector('.btn-close').click()
    expect(() => vi.advanceTimersByTime(3000)).not.toThrow()
    expect(view.messages.children).toHaveLength(0)
  })
})

describe('Botones de las tarjetas', () => {
  test('cada tarjeta tiene los botones de carrito, editar y borrar con sus iconos', () => {
    const card = view.renderBook(new Book(booksData[0]), modulesData[0])
    const icons = [...card.querySelectorAll('.card-actions button .material-icons')].map(icon => icon.textContent)
    expect(icons).toEqual(['add_shopping_cart', 'edit', 'delete'])
  })

  test('al pulsar el carrito el callback recibe la id del libro', () => {
    const handler = vi.fn()
    view.bindAddToCart(handler)
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)

    view.booksList.querySelector('.card[data-id="2"] button[data-action="cart"] .material-icons').click()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('2')
  })

  test('al pulsar editar el callback recibe la id del libro', () => {
    const handler = vi.fn()
    view.bindEditBook(handler)
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)

    view.booksList.querySelector('.card[data-id="1"] button[data-action="edit"]').click()

    expect(handler).toHaveBeenCalledWith('1')
  })

  test('los escuchadores funcionan con tarjetas pintadas después de enlazarlos', () => {
    const handler = vi.fn()
    view.bindAddToCart(handler)
    view.renderBooksList([new Book(booksData[0])], modulesData)
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)

    view.booksList.querySelector('.card[data-id="2"] button[data-action="cart"]').click()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('al pulsar borrar pide confirmación mostrando la id y el módulo', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const handler = vi.fn()
    view.bindRemoveBook(handler)
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)

    view.booksList.querySelector('.card[data-id="2"] button[data-action="delete"]').click()

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('2'))
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Programación'))
    expect(handler).toHaveBeenCalledWith('2')
  })

  test('si no se confirma el borrado no se llama al callback', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const handler = vi.fn()
    view.bindRemoveBook(handler)
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)

    view.booksList.querySelector('button[data-action="delete"]').click()

    expect(handler).not.toHaveBeenCalled()
  })

  test('un botón de una acción no dispara los callbacks de las otras', () => {
    const cart = vi.fn()
    const edit = vi.fn()
    view.bindAddToCart(cart)
    view.bindEditBook(edit)
    view.renderBooksList([new Book(booksData[0])], modulesData)

    view.booksList.querySelector('button[data-action="edit"]').click()

    expect(edit).toHaveBeenCalledTimes(1)
    expect(cart).not.toHaveBeenCalled()
  })
})

describe('renderUpdatedBook y removeBook', () => {
  test('renderUpdatedBook sustituye la tarjeta del libro sin cambiar su posición', () => {
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)

    view.renderUpdatedBook(new Book({ ...booksData[0], publisher: 'Santillana', price: 5 }), modulesData[0])

    const cards = view.booksList.querySelectorAll('.card')
    expect(cards).toHaveLength(2)
    expect(cards[0].dataset.id).toBe('1')
    expect(cards[0].textContent).toContain('Santillana')
    expect(cards[0].textContent).toContain('5 €')
  })

  test('removeBook quita la tarjeta del libro', () => {
    view.renderBooksList(booksData.map(book => new Book(book)), modulesData)
    view.removeBook(1)
    expect([...view.booksList.querySelectorAll('.card')].map(card => card.dataset.id)).toEqual(['2'])
  })
})

describe('Formulario de añadir y editar libro', () => {
  beforeEach(() => {
    view.renderModulesSelect(modulesData)
  })

  test('inicialmente es de añadir: título "Añadir libro" y la id oculta', () => {
    expect(view.formTitle.textContent).toBe('Añadir libro')
    expect(view.idDiv.classList.contains('hidden')).toBe(true)
  })

  test('al enviar el formulario el callback recibe los datos con los tipos adecuados', () => {
    const handler = vi.fn()
    view.bindSubmitBook(handler)
    fillBookForm(view.bookForm)

    view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      id: '',
      moduleCode: '0485',
      publisher: 'SM',
      price: 19.5,
      pages: 120,
      status: 'bad',
      photo: 'https://ejemplo.com/foto.png',
      comments: 'Subrayado a lápiz',
      soldDate: '',
    })
  })

  test('el envío no recarga la página (se cancela el evento por defecto)', () => {
    view.bindSubmitBook(vi.fn())
    const event = new Event('submit', { cancelable: true })
    view.bookForm.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  test('renderEditForm cambia el título, muestra la id deshabilitada y rellena los campos', () => {
    view.renderEditForm(new Book(booksData[1]))

    const fields = view.bookForm.elements
    expect(view.formTitle.textContent).toBe('Editar libro')
    expect(view.idDiv.classList.contains('hidden')).toBe(false)
    expect(view.idInput.disabled).toBe(true)
    expect(view.idInput.value).toBe('2')
    expect(fields.moduleCode.value).toBe('0485')
    expect(fields.publisher.value).toBe('Anaya')
    expect(fields.price.value).toBe('28')
    expect(fields.pages.value).toBe('180')
    expect(view.bookForm.querySelector('input[name="status"]:checked').value).toBe('new')
    expect(fields.photo.value).toBe('foto2.png')
    expect(fields.soldDate.value).toBe('2023-12-21')
  })

  test('al enviar en modo edición el callback recibe también la id', () => {
    const handler = vi.fn()
    view.bindSubmitBook(handler)
    view.renderEditForm(new Book(booksData[0]))

    view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: '1', publisher: 'Apunts', price: 12 }))
  })

  test('resetForm limpia los campos sin eliminar el formulario y vuelve al modo añadir', () => {
    view.renderEditForm(new Book(booksData[0]))
    view.resetForm()

    expect(document.getElementById('bookForm')).toBe(view.bookForm)
    expect(view.formTitle.textContent).toBe('Añadir libro')
    expect(view.idDiv.classList.contains('hidden')).toBe(true)
    expect(view.idInput.value).toBe('')
    expect(view.bookForm.elements.publisher.value).toBe('')
    expect(view.bookForm.querySelector('input[name="status"]:checked')).toBeNull()
    expect(view.moduleSelect.querySelectorAll('option')).toHaveLength(modulesData.length + 1)
  })

  test('el botón Reset también vuelve al modo añadir', () => {
    view.renderEditForm(new Book(booksData[0]))
    view.bookForm.querySelector('button[type="reset"]').click()

    expect(view.formTitle.textContent).toBe('Añadir libro')
    expect(view.idDiv.classList.contains('hidden')).toBe(true)
    expect(view.idInput.value).toBe('')
  })
})

describe('showPage', () => {
  test('muestra sólo la página indicada', () => {
    view.showPage('about')
    expect(view.about.classList.contains('hidden')).toBe(false)
    expect(view.booksList.classList.contains('hidden')).toBe(true)
    expect(view.form.classList.contains('hidden')).toBe(true)

    view.showPage('list')
    expect(view.booksList.classList.contains('hidden')).toBe(false)
    expect(view.about.classList.contains('hidden')).toBe(true)
  })
})

describe('Validación del formulario', () => {
  const FIELDS = ['moduleCode', 'publisher', 'price', 'pages', 'status']
  const error = name => document.getElementById(`${name}-error`).textContent
  const submit = () => view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
  const type = (name, value) => {
    const field = view.bookForm.elements[name]
    field.value = value
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
  let handler

  beforeEach(() => {
    view.renderModulesSelect(modulesData)
    handler = vi.fn()
    view.bindSubmitBook(handler)
  })

  test('con el formulario vacío no se envía y se muestran a la vez los errores de todos los campos', () => {
    submit()
    expect(handler).not.toHaveBeenCalled()
    FIELDS.forEach(name => expect(error(name)).not.toBe(''))
  })

  test('foto, comentarios y fecha de venta pueden quedarse vacíos', () => {
    fillBookForm(view.bookForm)
    type('photo', '')
    type('comments', '')
    submit()
    expect(handler).toHaveBeenCalledTimes(1)
    FIELDS.forEach(name => expect(error(name)).toBe(''))
  })

  test('sólo se muestra error en los campos incorrectos', () => {
    fillBookForm(view.bookForm)
    type('publisher', '')
    submit()
    expect(handler).not.toHaveBeenCalled()
    expect(error('publisher')).not.toBe('')
    expect(['moduleCode', 'price', 'pages', 'status'].map(error)).toEqual(['', '', '', ''])
  })

  test('el precio admite céntimos y 0', () => {
    fillBookForm(view.bookForm)
    type('price', '19.99')
    submit()
    type('price', '0')
    submit()
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(expect.objectContaining({ price: 0 }))
  })

  test('precio vacío, negativo o con demasiados decimales dan mensajes distintos', () => {
    fillBookForm(view.bookForm)
    const messages = ['', '-1', '3.555'].map(value => {
      type('price', value)
      submit()
      return error('price')
    })
    expect(handler).not.toHaveBeenCalled()
    messages.forEach(message => expect(message).not.toBe(''))
    expect(new Set(messages).size).toBe(3)
  })

  test('las páginas deben ser un entero mayor o igual que 1', () => {
    fillBookForm(view.bookForm)
    const messages = ['', '0', '3.5'].map(value => {
      type('pages', value)
      submit()
      return error('pages')
    })
    expect(handler).not.toHaveBeenCalled()
    expect(new Set(messages).size).toBe(3)
    type('pages', '1')
    submit()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('los mensajes son nuestros, no los del navegador', () => {
    submit()
    expect(error('publisher')).not.toBe(view.bookForm.elements.publisher.validationMessage)
    expect(error('price')).toMatch(/precio/i)
  })

  test('al corregir un campo con error su mensaje se actualiza sin volver a enviar', () => {
    fillBookForm(view.bookForm)
    type('price', '-1')
    submit()
    const negative = error('price')
    type('price', '1.234')
    expect(error('price')).not.toBe(negative)
    expect(error('price')).not.toBe('')
    type('price', '1.23')
    expect(error('price')).toBe('')
  })

  test('al marcar el estado desaparece su error', () => {
    submit()
    view.bookForm.querySelector('#status-good').click()
    expect(error('status')).toBe('')
  })

  test('al pulsar Reset no queda ningún error', () => {
    submit()
    view.bookForm.querySelector('button[type="reset"]').click()
    FIELDS.forEach(name => expect(error(name)).toBe(''))
  })

  test('al editar un libro no queda ningún error de antes y se valida igual', () => {
    submit()
    view.renderEditForm(new Book(booksData[0]))
    FIELDS.forEach(name => expect(error(name)).toBe(''))

    type('pages', '2.5')
    submit()
    expect(handler).not.toHaveBeenCalled()
    expect(error('pages')).not.toBe('')
  })
})

describe('Módulo repetido', () => {
  const error = () => document.getElementById('moduleCode-error').textContent
  const chooseModule = code => {
    view.moduleSelect.value = code
    view.moduleSelect.dispatchEvent(new Event('change', { bubbles: true }))
  }

  beforeEach(() => {
    view.renderModulesSelect(modulesData)
  })

  test('al cambiar el módulo se avisa con el módulo y la id del libro', () => {
    const handler = vi.fn()
    view.bindModuleChange(handler)
    chooseModule('0373')
    expect(handler).toHaveBeenCalledWith('0373', '')
  })

  test('el error personalizado impide enviar y sólo se muestra el error del módulo', () => {
    const submitHandler = vi.fn()
    view.bindSubmitBook(submitHandler)
    chooseModule('0373')
    view.setModuleError('0373', '', 'Módulo repetido')

    expect(error()).toBe('Módulo repetido')
    expect(document.getElementById('publisher-error').textContent).toBe('')

    fillBookForm(view.bookForm)
    chooseModule('0373')
    view.setModuleError('0373', '', 'Módulo repetido')
    view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))
    expect(submitHandler).not.toHaveBeenCalled()
  })

  test('al cambiar de módulo se quita el error personalizado', () => {
    chooseModule('0373')
    view.setModuleError('0373', '', 'Módulo repetido')
    chooseModule('0485')
    view.clearModuleError('0485', '')
    expect(error()).toBe('')
    expect(view.moduleSelect.validity.valid).toBe(true)
  })

  test('se ignora la respuesta de un módulo que ya no está elegido', () => {
    chooseModule('0373')
    chooseModule('0485')
    view.setModuleError('0373', '', 'Módulo repetido')
    expect(error()).toBe('')
    expect(view.moduleSelect.validity.valid).toBe(true)
  })

  test('Reset y editar quitan el error personalizado', () => {
    chooseModule('0373')
    view.setModuleError('0373', '', 'Módulo repetido')
    view.resetForm()
    expect(error()).toBe('')
    expect(view.moduleSelect.validity.customError).toBe(false)

    chooseModule('0373')
    view.setModuleError('0373', '', 'Módulo repetido')
    view.renderEditForm(new Book(booksData[0]))
    expect(error()).toBe('')
    expect(view.moduleSelect.validity.customError).toBe(false)
  })
})
