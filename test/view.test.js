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
