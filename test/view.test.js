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

describe('Formulario de añadir libro', () => {
  beforeEach(() => {
    view.renderModulesSelect(modulesData)
  })

  test('al enviar el formulario el callback recibe los datos con los tipos adecuados', () => {
    const handler = vi.fn()
    view.bindAddBook(handler)
    fillBookForm(view.bookForm)

    view.bookForm.dispatchEvent(new Event('submit', { cancelable: true }))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      userId: 9,
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
    view.bindAddBook(vi.fn())
    const event = new Event('submit', { cancelable: true })
    view.bookForm.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  test('al restablecer el formulario se limpian los campos sin eliminarlo', () => {
    fillBookForm(view.bookForm)
    view.resetForm()

    expect(document.getElementById('bookForm')).toBe(view.bookForm)
    expect(view.bookForm.elements.userId.value).toBe('')
    expect(view.bookForm.elements.moduleCode.value).toBe('')
    expect(view.bookForm.elements.publisher.value).toBe('')
    expect(view.bookForm.elements.comments.value).toBe('')
    expect(view.bookForm.querySelector('input[name="status"]:checked')).toBeNull()
    expect(view.moduleSelect.querySelectorAll('option')).toHaveLength(modulesData.length + 1)
  })
})

describe('Borrar libro', () => {
  test('al solicitar una eliminación el callback recibe la id', () => {
    const handler = vi.fn()
    view.bindRemoveBook(handler)
    view.removeInput.value = '2'

    document.getElementById('remove-button').click()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('2')
    expect(view.messages.querySelector('.alert-error')).toBeNull()
  })

  test('si la id está vacía muestra un error y no llama al callback', () => {
    const handler = vi.fn()
    view.bindRemoveBook(handler)
    view.removeInput.value = ''

    document.getElementById('remove-button').click()

    expect(handler).not.toHaveBeenCalled()
    expect(view.messages.querySelector('.alert-error')).not.toBeNull()
  })
})
