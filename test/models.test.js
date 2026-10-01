import { describe, expect, test } from 'vitest'
import Book from '../src/model/book.class.js'
import User from '../src/model/user.class.js'
import Module from '../src/model/module.class.js'

describe('class Book', () => {
  test('crea un libro con todas sus propiedades', () => {
    const book = new Book({
      id: 1, userId: 7, moduleCode: '0373', publisher: 'Apunts', price: 12,
      pages: 40, status: 'good', photos: 'foto.png', comments: 'ok', soldDate: '2024-01-01',
    })
    expect(book).toBeInstanceOf(Book)
    expect(book).toEqual({
      id: 1, userId: 7, moduleCode: '0373', publisher: 'Apunts', price: 12,
      pages: 40, status: 'good', photos: 'foto.png', comments: 'ok', soldDate: '2024-01-01',
    })
  })

  test('acepta el campo photo de datos.js como photos', () => {
    const book = new Book({ id: 1, userId: 7, moduleCode: '0373', publisher: 'Apunts', price: 12, pages: 40, status: 'good', photo: 'foto.png' })
    expect(book.photos).toBe('foto.png')
  })

  test('photos, comments y soldDate valen "" si no se indican', () => {
    const book = new Book({ id: 1, userId: 7, moduleCode: '0373', publisher: 'Apunts', price: 12, pages: 40, status: 'good' })
    expect(book.photos).toBe('')
    expect(book.comments).toBe('')
    expect(book.soldDate).toBe('')
  })
})

describe('class User', () => {
  test('crea un usuario con todas sus propiedades', () => {
    const user = new User(7, 'Laura', 'laura@x.com', 'abcd')
    expect(user).toBeInstanceOf(User)
    expect(user).toEqual({ id: 7, nick: 'Laura', email: 'laura@x.com', password: 'abcd' })
  })
})

describe('class Module', () => {
  test('crea un módulo con todas sus propiedades', () => {
    const module = new Module('0373', 'Módulo X', 'Mòdul X', '41')
    expect(module).toBeInstanceOf(Module)
    expect(module).toEqual({ code: '0373', cliteral: 'Módulo X', vliteral: 'Mòdul X', courseId: '41' })
  })
})
