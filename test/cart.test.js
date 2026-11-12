import { beforeEach, describe, expect, test } from 'vitest'
import Cart from '../src/model/cart.class.js'
import Book from '../src/model/book.class.js'

const book1 = new Book({ id: 1, userId: 7, moduleCode: '0373', publisher: 'Apunts', price: 12, pages: 40, status: 'good' })
const book2 = new Book({ id: 2, userId: 8, moduleCode: '0485', publisher: 'Anaya', price: 28, pages: 180, status: 'new' })

let cart

beforeEach(() => {
  cart = new Cart()
})

describe('Cart constructor y populate', () => {
  test('un carrito nuevo está vacío', () => {
    expect(cart.data).toEqual([])
  })

  test('populate no hace nada por ahora', () => {
    cart.populate()
    expect(cart.data).toEqual([])
  })
})

describe('addItem', () => {
  test('añade una copia del libro, no el propio libro', () => {
    cart.addItem(book1)
    expect(cart.data).toHaveLength(1)
    expect(cart.data[0]).toBeInstanceOf(Book)
    expect(cart.data[0]).toEqual(book1)
    expect(cart.data[0]).not.toBe(book1)
  })

  test('modificar el libro original no cambia el del carrito', () => {
    const original = new Book({ ...book1 })
    cart.addItem(original)
    original.price = 99
    expect(cart.getBookById(1).price).toBe(12)
  })

  test('lanza un error si el libro ya está en el carrito', () => {
    cart.addItem(book1)
    expect(() => cart.addItem(book1)).toThrow(Error)
    expect(cart.data).toHaveLength(1)
  })
})

describe('getBookById', () => {
  test('devuelve el libro del carrito con esa id', () => {
    cart.addItem(book1)
    cart.addItem(book2)
    expect(cart.getBookById(2).publisher).toBe('Anaya')
  })

  test('devuelve {} si no está', () => {
    expect(cart.getBookById(500)).toEqual({})
  })
})

describe('removeItem', () => {
  test('borra el libro con esa id', () => {
    cart.addItem(book1)
    cart.addItem(book2)
    cart.removeItem(1)
    expect(cart.data.map(book => book.id)).toEqual([2])
  })

  test('lanza un error si el libro no está', () => {
    cart.addItem(book1)
    expect(() => cart.removeItem(500)).toThrow(Error)
    expect(cart.data).toHaveLength(1)
  })
})

describe('toString', () => {
  test('devuelve una línea por libro', () => {
    cart.addItem(book1)
    cart.addItem(book2)
    const lines = cart.toString().split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('ID: 2')
  })

  test('un carrito vacío devuelve ""', () => {
    expect(cart.toString()).toBe('')
  })
})
