// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Router from '../src/services/router.js'
import View from '../src/view/view.class.js'
import Book from '../src/model/book.class.js'
import { html, booksData } from './fixtures/dom.js'

let view
let router

const visible = () => ['list', 'form', 'about'].filter(id => !document.getElementById(id).classList.contains('hidden'))

beforeEach(() => {
  window.location.hash = ''
  document.body.innerHTML = html
  view = new View()
  router = new Router(view)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Router', () => {
  test('sin hash muestra la lista de libros', () => {
    router.navigate()
    expect(visible()).toEqual(['list'])
  })

  test('muestra sólo la página del hash', () => {
    window.location.hash = '#about'
    router.navigate()
    expect(visible()).toEqual(['about'])
  })

  test('una ruta desconocida muestra la lista', () => {
    window.location.hash = '#noexiste'
    router.navigate()
    expect(visible()).toEqual(['list'])
  })

  test('al cambiar el hash cambia la página mostrada', async () => {
    router.init()
    window.location.hash = '#about'
    await vi.waitFor(() => expect(visible()).toEqual(['about']))
    window.location.hash = '#list'
    await vi.waitFor(() => expect(visible()).toEqual(['list']))
  })

  test('#form muestra el formulario vacío y en modo añadir aunque se estuviera editando', () => {
    view.renderEditForm(new Book(booksData[0]))
    window.location.hash = '#form'
    router.navigate()

    expect(visible()).toEqual(['form'])
    expect(view.formTitle.textContent).toBe('Añadir libro')
    expect(view.idInput.value).toBe('')
    expect(view.bookForm.elements.publisher.value).toBe('')
  })

  test('#edit muestra el formulario sin vaciarlo', () => {
    view.renderEditForm(new Book(booksData[0]))
    window.location.hash = '#edit'
    router.navigate()

    expect(visible()).toEqual(['form'])
    expect(view.formTitle.textContent).toBe('Editar libro')
    expect(view.bookForm.elements.publisher.value).toBe('Apunts')
  })
})
